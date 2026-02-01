// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAchievementNFT {
	function mintAchievement(
		address to,
		string memory title,
		string memory desc,
		uint8 rarity
	) external;
}

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

	IAchievementNFT public achievementNFT;

	mapping(address => uint256) public userVerifiedCount;
	mapping(address => uint256) public userStreakCount;
	mapping(address => uint256) public userVerifierCount;
	mapping(address => uint256) public userHighStakeCount;
	mapping(address => uint256) public userTotalStaked;
	mapping(address => uint256) public userLongestStreak;
	mapping(address => bool) public userEarlyAdopter;
	mapping(address => uint256) public lastVerifiedTimestamp;

	address public owner;

	uint256 public constant PLATFORM_SUCCESS_FEE = 2;
	uint256 public constant PLATFORM_FAIL_FEE = 8;
	uint256 public constant VERIFIER_FEE = 2;
	uint256 public constant MIN_DURATION = 1 hours;

	bool private locked;

	event CommitmentCreated(
		uint256 indexed id,
		address indexed student,
		address verifier,
		uint256 stake,
		uint256 deadline
	);
	event ProofSubmitted(uint256 indexed id, string proof);
	event Verified(uint256 indexed id, bool approved, uint256 verifierEarned);
	event EmergencyRelease(uint256 indexed id, address student, uint256 amount);
	event WithdrawalClaimed(address indexed user, uint256 amount);

	constructor(address _nftContract) {
		require(_nftContract != address(0), "INVALID NFT CONTRACT");
		require(PLATFORM_FAIL_FEE + VERIFIER_FEE <= 100, "INVALID FEE CONFIG");

		owner = msg.sender;
		achievementNFT = IAchievementNFT(_nftContract);
	}

	modifier nonReentrant() {
		require(!locked, "REENTRANT");
		locked = true;
		_;
		locked = false;
	}

	/**
	 * @notice Student deposits ETH to lock in a study goal.
	 * @param _goal Description of the study task.
	 * @param _verifier Wallet address of the person checking the work.
	 * @param _duration Time in seconds until deadline.
	 */
	function createCommitment(
		string memory _goal,
		address _verifier,
		uint256 _duration
	) external payable {
		require(msg.value >= 0.001 ether, "STAKE TOO LOW");
		require(_verifier != address(0), "INVALID VERIFIER");
		require(_verifier != msg.sender, "CANNOT SELF-VERIFY");
		require(_duration >= MIN_DURATION, "DURATION TOO SHORT");

		userTotalStaked[msg.sender] += msg.value;
		if (msg.value >= 0.05 ether) {
			userHighStakeCount[msg.sender]++;
		}
		if (!userEarlyAdopter[msg.sender] && block.timestamp < 1767225600) {
			userEarlyAdopter[msg.sender] = true;
		}

		commitments[commitmentCount] = Commitment({
			student: msg.sender,
			verifier: _verifier,
			goal: _goal,
			proof: "",
			stake: msg.value,
			deadline: block.timestamp + _duration,
			status: Status.Active
		});

		emit CommitmentCreated(
			commitmentCount,
			msg.sender,
			_verifier,
			msg.value,
			block.timestamp + _duration
		);
		commitmentCount++;
	}

	/**
	 * @notice Student submits proof link/hash before deadline.
	 * @param _id Commitment ID.
	 * @param _proof URL or Hash of the work.
	 */
	function submitProof(uint256 _id, string memory _proof) external {
		Commitment storage c = commitments[_id];
		require(msg.sender == c.student, "NOT STUDENT");
		require(block.timestamp <= c.deadline, "DEADLINE PASSED");
		require(c.status == Status.Active, "NOT ACTIVE");
		require(bytes(_proof).length > 0, "PROOF EMPTY");

		c.proof = _proof;
		c.status = Status.Submitted;

		emit ProofSubmitted(_id, _proof);
	}

	/**
	 * @notice Verifier approves or rejects the proof.
	 * @dev Optimized Fee: Verifier only earns if they act.
	 * @param _id Commitment ID.
	 * @param _approved True = Pass, False = Fail.
	 */
	function verifyCommitment(uint256 _id, bool _approved) external nonReentrant {
		Commitment storage c = commitments[_id];
		require(msg.sender == c.verifier, "NOT VERIFIER");
		require(c.status == Status.Submitted, "NOT SUBMITTED");

		userVerifierCount[msg.sender]++;

		uint256 vFee = (c.stake * VERIFIER_FEE) / 100;
		uint256 pFee;
		uint256 refund;

		if (_approved) {
			c.status = Status.Verified;
			pFee = (c.stake * PLATFORM_SUCCESS_FEE) / 100;
			_mintAchievement(c.student);
		} else {
			c.status = Status.Failed;
			pFee = (c.stake * PLATFORM_FAIL_FEE) / 100;
		}

		refund = c.stake - pFee - vFee;

		_safeTransfer(owner, pFee);
		_safeTransfer(c.verifier, vFee);
		_safeTransfer(c.student, refund);

		emit Verified(_id, _approved, vFee);
	}

	/**
	 * @notice Student reclaims funds if verifier disappears.
	 * @dev Available 3 days AFTER deadline. Verifier gets $0 fees.
	 */
	function emergencyWithdraw(uint256 _id) external nonReentrant {
		Commitment storage c = commitments[_id];
		require(msg.sender == c.student, "NOT STUDENT");
		require(block.timestamp > c.deadline + 3 days, "GRACE PERIOD ACTIVE");
		require(c.status != Status.Verified && c.status != Status.Failed, "ALREADY SETTLED");

		uint256 amount = c.stake;

		delete commitments[_id];

		_safeTransfer(msg.sender, amount);
		emit EmergencyRelease(_id, msg.sender, amount);
	}

	/**
	 * @dev Internal function to track streaks and mint NFTs.
	 * Awards achievements based on various criteria for fairness and difficulty.
	 */
	function _mintAchievement(address student) internal {
		userVerifiedCount[student]++;

		if (block.timestamp - lastVerifiedTimestamp[student] > 7 days) {
			userStreakCount[student] = 1;
		} else {
			userStreakCount[student]++;
		}

		if (userStreakCount[student] > userLongestStreak[student]) {
			userLongestStreak[student] = userStreakCount[student];
		}

		lastVerifiedTimestamp[student] = block.timestamp;

		if (userVerifiedCount[student] == 1) {
			try
				achievementNFT.mintAchievement(
					student,
					"Genesis Scholar",
					"Completed your first study commitment",
					0
				)
			{} catch {}
		}

		if (userVerifiedCount[student] == 3) {
			try
				achievementNFT.mintAchievement(
					student,
					"Getting Started",
					"Completed 3 commitments successfully",
					0
				)
			{} catch {}
		}

		if (userStreakCount[student] == 3) {
			try
				achievementNFT.mintAchievement(
					student,
					"Consistency King",
					"Maintained a 3-day study streak",
					1
				)
			{} catch {}
		}

		if (userStreakCount[student] == 7) {
			try
				achievementNFT.mintAchievement(
					student,
					"Week Warrior",
					"Completed 7 commitments in a row",
					2
				)
			{} catch {}
		}

		if (userVerifiedCount[student] == 10) {
			try
				achievementNFT.mintAchievement(
					student,
					"Dedicated Learner",
					"Completed 10 study commitments",
					1
				)
			{} catch {}
		}

		if (userVerifiedCount[student] == 25) {
			try
				achievementNFT.mintAchievement(
					student,
					"Scholar",
					"Completed 25 study commitments",
					1
				)
			{} catch {}
		}

		if (userHighStakeCount[student] >= 3) {
			try
				achievementNFT.mintAchievement(
					student,
					"High Roller",
					"Completed 3+ high-stakes commitments (>=0.05 ETH)",
					1
				)
			{} catch {}
		}

		if (userVerifiedCount[student] == 50) {
			try
				achievementNFT.mintAchievement(
					student,
					"Master Scholar",
					"Completed 50 study commitments",
					2
				)
			{} catch {}
		}

		if (userLongestStreak[student] >= 30) {
			try
				achievementNFT.mintAchievement(
					student,
					"Iron Will",
					"Maintained a 30-day study streak",
					2
				)
			{} catch {}
		}

		if (userTotalStaked[student] >= 1 ether) {
			try
				achievementNFT.mintAchievement(
					student,
					"Wealth of Knowledge",
					"Staked over 1 ETH total in commitments",
					2
				)
			{} catch {}
		}

		if (userVerifiedCount[student] == 100) {
			try
				achievementNFT.mintAchievement(
					student,
					"Legendary Scholar",
					"Completed 100 study commitments",
					3
				)
			{} catch {}
		}

		if (userLongestStreak[student] >= 100) {
			try
				achievementNFT.mintAchievement(
					student,
					"Century Streak",
					"Maintained a 100-day study streak",
					3
				)
			{} catch {}
		}

		if (userTotalStaked[student] >= 10 ether) {
			try
				achievementNFT.mintAchievement(
					student,
					"Knowledge Baron",
					"Staked over 10 ETH total in commitments",
					3
				)
			{} catch {}
		}

		if (userEarlyAdopter[student] && userVerifiedCount[student] >= 50) {
			try
				achievementNFT.mintAchievement(
					student,
					"Pioneer",
					"Early adopter who completed 50+ commitments",
					3
				)
			{} catch {}
		}

		if (userVerifierCount[student] >= 25) {
			try
				achievementNFT.mintAchievement(
					student,
					"Mentor",
					"Verified 25+ commitments for others",
					1
				)
			{} catch {}
		}

		if (userVerifierCount[student] >= 100) {
			try
				achievementNFT.mintAchievement(
					student,
					"Guardian",
					"Verified 100+ commitments for others",
					2
				)
			{} catch {}
		}

		if (userVerifierCount[student] >= 500) {
			try
				achievementNFT.mintAchievement(
					student,
					"Sage",
					"Verified 500+ commitments for others",
					3
				)
			{} catch {}
		}
	}

	/**
	 * @dev Safely sends ETH. If it fails, queues it for withdrawal.
	 */
	function _safeTransfer(address _to, uint256 _amount) internal {
		if (_amount == 0) return;
		(bool success, ) = _to.call{value: _amount}("");
		if (!success) {
			pendingWithdrawals[_to] += _amount;
		}
	}

	/**
	 * @notice Manually claim any failed transfers.
	 */
	function withdrawPending() external nonReentrant {
		uint256 amount = pendingWithdrawals[msg.sender];
		require(amount > 0, "EMPTY");

		pendingWithdrawals[msg.sender] = 0;

		(bool success, ) = msg.sender.call{value: amount}("");
		require(success, "FAIL");

		emit WithdrawalClaimed(msg.sender, amount);
	}

    function adminMint(address _to, string memory _title, string memory _desc, uint8 _rarity) external {
        require(msg.sender == owner, "NOT OWNER");
        achievementNFT.mintAchievement(_to, _title, _desc, _rarity);
    }
}

