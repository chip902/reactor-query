import { ReactNode } from "react";
import "./globals.css";
import { ClientProviders } from "@/contexts/providers";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NavigationBar from "@/components/nav/NavigationBar";
import { FloatingThemeToggle } from "@/components/theme/ThemeSwitcher";
import { Metadata } from "next";
import Footer from "@/components/footer/Footer";

export const metadata: Metadata = {
	title: {
		template: "%s | Perpetua Digital Assistant",
		default: "Perpetua Digital Assistant",
	},
	description: "Perpetua Digital Assistant for Adobe Tag Managment systems",
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/favicon.ico",
	},
};

const PageContainer = ({ children }: { children: ReactNode }) => {
	return <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>;
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className="h-full" suppressHydrationWarning>
			<body className="min-h-screen flex flex-col">
				<ClientProviders>
					<ThemeProvider>
						<div className="flex flex-col min-h-screen">
							<NavigationBar />
							<PageContainer>{children}</PageContainer>
							<Footer />
							<FloatingThemeToggle />
						</div>
					</ThemeProvider>
				</ClientProviders>
			</body>
		</html>
	);
}
