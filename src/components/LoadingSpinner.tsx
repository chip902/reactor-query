const LoadingSpinner = () => {
	return (
		<div className="flex items-center justify-center py-8">
			<div className="space-y-4 text-center">
				<div className="relative w-16 h-16 mx-auto">
					<div className="w-full h-full rounded-full border-4 border-gray-200"></div>
					<div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
				</div>
				<div className="text-gray-500 text-base">Loading...</div>
			</div>
		</div>
	);
};

export default LoadingSpinner;
