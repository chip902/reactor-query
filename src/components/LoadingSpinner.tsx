const LoadingSpinner = () => {
	return (
		<div className="flex items-center justify-center py-8">
			<div className="space-y-4 text-center">
				<div className="relative w-16 h-16 mx-auto">
					<div className="w-full h-full rounded-full border-4 border-[var(--color-border)]"></div>
					<div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-[var(--color-button-primary-bg)] border-t-transparent animate-spin"></div>
				</div>
				<div className="text-[var(--color-text-secondary)] text-base">Loading...</div>
			</div>
		</div>
	);
};

export default LoadingSpinner;
