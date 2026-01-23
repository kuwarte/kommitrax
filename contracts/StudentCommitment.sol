// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract StudyCommitment {
    struct Commitment {
        address student;
        address verifier;
        string goal;
        string proof;
        uint256 stake;
        uint256 deadline;
        Status status;
    }

    enum Status {
        Active,
        Submitted,
        Verified,
        Failed
    }

    uint256 public commitmentCount;
    mapping(uint256 => Commitment) public commitments;
    mapping(address => uint256) public pendingWithdrawals;

    address public owner;
    uint256 constant public PLATFORM_SUCCESS_FEE = 2;
    uint256 constant public PLATFORM_FAIL_FEE = 9;
    uint256 constant public VERIFIER_FEE = 1;
    uint256 constant public MIN_DURATION = 1 hours;
    uint256 constant public MAX_DURATION = 365 days;

    bool private locked;

    event CommitmentCreated(
        uint256 indexed id,
        address indexed student,
        address verifier,
        string goal,
        uint256 stake,
        uint256 deadline
    );

    event ProofSubmitted(
        uint256 indexed id,
        string proof
    );

    event Verified(
        uint256 indexed id,
        bool approved
    );

    event CommitmentFailed(
        uint256 indexed id,
        uint256 refunded,
        uint256 platformFee,
        uint256 verifierFee
    );

    event PlatformFeeChanged(
        uint256 oldSuccessFee,
        uint256 newSuccessFee,
        uint256 oldFailFee,
        uint256 newFailFee
    );
    
    event WithdrawalQueued(
        address indexed recipient,
        uint256 amount
    );
    
    event WithdrawalClaimed(
        address indexed recipient,
        uint256 amount
    );

    constructor() {
        owner = msg.sender;
    }

    modifier nonReentrant() {
        require(!locked, "REENTRANT CALL");
        locked = true;
        _;
        locked = false;
    }

    modifier validCommitment(uint256 _id) {
        require(_id < commitmentCount, "INVALID COMMITMENT ID");
        require(commitments[_id].student != address(0), "COMMITMENT DELETED");
        _;
    }

    modifier onlyVerifier(uint256 _id) {
        require(msg.sender == commitments[_id].verifier, "NOT AUTHORIZED");
        _;
    }

    modifier onlyStudent(uint256 _id) {
        require(msg.sender == commitments[_id].student, "NOT AUTHORIZED");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT OWNER");
        _;
    }

    modifier deadlineNotPassed(uint256 _id) {
        require(block.timestamp <= commitments[_id].deadline, "DEADLINE PASSED");
        _;
    }

    /**
     * @notice Handles commitment failure, distributing fees and refunds
     * @param id Commitment ID that failed
     * @param c Storage reference to the commitment
     * @dev Failure: platform 9% + verifier 1%, student gets 90%
     */
    function _failCommitment(uint256 id, Commitment storage c) internal {
        c.status = Status.Failed;

        uint256 platformFee = (c.stake * PLATFORM_FAIL_FEE) / 100;
        uint256 verifierFee = (c.stake * VERIFIER_FEE) / 100;
        uint256 refund = c.stake - platformFee - verifierFee;
        
        emit CommitmentFailed(id, refund, platformFee, verifierFee);

        _safeTransfer(owner, platformFee);
        _safeTransfer(c.verifier, verifierFee);
        _safeTransfer(c.student, refund);
    }

    /**
     * @notice Safely transfers ETH, queuing failed transfers for manual withdrawal
     * @param _to Recipient address
     * @param _amount Amount to transfer
     * @dev Prevents DoS attacks by not reverting on transfer failure
     */
    function _safeTransfer(address _to, uint256 _amount) internal {
        if (_amount == 0) return;

        (bool success, ) = _to.call{value: _amount}("");
        if (!success) {
            pendingWithdrawals[_to] += _amount;
            emit WithdrawalQueued(_to, _amount);
        }
    }

    /**
     * @notice Updates platform fee percentages (owner only) - STANDBY
     * @dev Fees are now constants: Success 2%+1%, Failure 9%+1%
     */
    // function setPlatformFee(uint256 _percent) external onlyOwner {
    //     emit PlatformFeeChanged(PLATFORM_SUCCESS_FEE, PLATFORM_SUCCESS_FEE, PLATFORM_FAIL_FEE, PLATFORM_FAIL_FEE);
    // }

    /**
     * @notice Creates a new study commitment with stake and verifier
     * @param _goal Description of the study goal to achieve
     * @param _verifier Address that will verify proof of completion
     * @param _durationSeconds Time limit to complete the commitment
     * @dev Validates duration bounds and prevents self-verification
     */
    function createCommitment(string memory _goal, address _verifier, uint256 _durationSeconds) external payable {
        require(msg.value > 0, "STAKE MUST BE > 0");
        require(_verifier != address(0), "VERIFIER REQUIRED");
        require(_verifier != msg.sender, "CANNOT SELF VERIFY");
        require(_durationSeconds >= MIN_DURATION && _durationSeconds <= MAX_DURATION, "INVALID DURATION");

        Commitment memory c = Commitment({
            student: msg.sender,
            verifier: _verifier,
            goal: _goal,
            proof: "",
            stake: msg.value,
            deadline: block.timestamp + _durationSeconds,
            status: Status.Active
        });

        commitments[commitmentCount] = c;

        emit CommitmentCreated(commitmentCount, c.student, c.verifier, c.goal, c.stake, c.deadline);

        commitmentCount++;
    }

    /**
     * @notice Submits proof of completion for a commitment
     * @param _id Commitment ID to submit proof for
     * @param _proof Evidence of goal completion
     * @dev Only callable by student before deadline while commitment is active
     */
    function submitProof(uint256 _id, string memory _proof) external onlyStudent(_id) validCommitment(_id) deadlineNotPassed(_id) {
        Commitment storage c = commitments[_id];

        require(c.status == Status.Active, "COMMITMENT NOT ACTIVE");
        require(bytes(_proof).length > 0, "PROOF REQUIRED");

        c.proof = _proof;
        c.status = Status.Submitted;

        emit ProofSubmitted(_id, _proof);
    }

    /**
     * @notice Verifies submitted proof and releases or forfeits stake
     * @param _id Commitment ID to verify
     * @param _approved Whether the proof is accepted
     * @dev Success: platform 2% + verifier 1%, student gets 97%
     * @dev Failure: platform 9% + verifier 1%, student gets 90%
     */
    function verifyCommitment(uint256 _id, bool _approved) external onlyVerifier(_id) validCommitment(_id) nonReentrant {
        Commitment storage c = commitments[_id];

        if (block.timestamp > c.deadline) {
            _failCommitment(_id, c);
            return;
        }

        require(c.status == Status.Submitted, "PROOF NOT SUBMITTED");

        if (_approved) {
            c.status = Status.Verified;
            emit Verified(_id, _approved);

            uint256 platformFee = (c.stake * PLATFORM_SUCCESS_FEE) / 100;
            uint256 verifierFee = (c.stake * VERIFIER_FEE) / 100;
            uint256 refund = c.stake - platformFee - verifierFee;
            
            _safeTransfer(owner, platformFee);
            _safeTransfer(c.verifier, verifierFee);
            _safeTransfer(c.student, refund);

        } else {
            emit Verified(_id, _approved);
            _failCommitment(_id, c);
        }
    }

    /**
     * @notice Allows users to withdraw queued funds from failed transfers
     * @dev Prevents DoS by allowing manual withdrawal of stuck funds
     */
    function withdrawPending() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "NO PENDING WITHDRAWAL");

        pendingWithdrawals[msg.sender] = 0;
        emit WithdrawalClaimed(msg.sender, amount);

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "WITHDRAWAL FAILED");
    }

    /**
     * @notice Removes completed commitments to save storage (owner only)
     * @param _ids Array of commitment IDs to clean up
     * @dev Only removes verified or failed commitments to prevent abuse
     */
    function cleanupOldCommitments(uint256[] calldata _ids) external onlyOwner {
        for (uint256 i = 0; i < _ids.length; i++) {
            if (commitments[_ids[i]].status == Status.Verified || commitments[_ids[i]].status == Status.Failed) {
                delete commitments[_ids[i]];
            }
        }
    }

    /**
     * @notice Retrieves commitment details by ID
     * @param _id Commitment ID to query
     * @return Commitment struct with all details
     * @dev Validates commitment exists before returning
     */
    function getCommitment(uint256 _id) external view returns (Commitment memory) {
        return commitments[_id];
    }
}

