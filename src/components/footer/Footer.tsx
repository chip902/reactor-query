"use client";

const Footer = () => {
	return (
		<footer className="mt-auto w-full bg-blue-500 py-4">
			<div className="container mx-auto text-center text-white">
				<p>© {new Date().getFullYear()} Chip Hosting Solutions LLC All rights reserved.</p>
			</div>
		</footer>
	);
};

export default Footer;
