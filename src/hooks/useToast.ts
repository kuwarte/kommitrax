import { useState, useCallback, useRef, useEffect } from "react";
import { ToastState } from "@/lib/types";

export function useToast(duration = 4000) {
	const [toast, setToast] = useState<ToastState | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const clearToast = useCallback(() => {
		setToast(null);
	}, []);

	const showToast = useCallback(
		(type: "success" | "error", title: string, msg: string) => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}

			setToast({ type, title, msg });

			timerRef.current = setTimeout(() => {
				setToast(null);
				timerRef.current = null;
			}, duration);
		},
		[duration]
	);

	const showSuccess = useCallback(
		(title: string, msg: string) => {
			showToast("success", title, msg);
		},
		[showToast]
	);

	const showError = useCallback(
		(title: string, msg: string) => {
			showToast("error", title, msg);
		},
		[showToast]
	);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	return {
		toast,
		showSuccess,
		showError,
		clearToast,
	};
}
