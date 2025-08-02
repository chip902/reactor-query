"use client";

import { useState } from "react";
import { TextArea, Picker, Item, InlineAlert, Heading, Content, TextField } from "@adobe/react-spectrum";
import "./style.css";

const supportSubjects = ["API Key Settings", "Search", "Relationships", "Exporting", "Extension Filter", "Publish History", "Feature Request", "Other"];

const SupportPage = () => {
	const [subject, setSubject] = useState(supportSubjects[0]);
	const [message, setMessage] = useState("");
	const [email, setEmail] = useState("");
	const [isEmailValid, setIsEmailValid] = useState(false);
	const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState("");

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleEmailChange = (value: string) => {
		setEmail(value);
		setIsEmailValid(validateEmail(value));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !message) {
			setStatus("error");
			setErrorMessage("Please fill in all required fields.");
			return;
		}

		setStatus("sending");

		try {
			const response = await fetch("/api/admin/sendsupportemail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					subject,
					message,
					userEmail: email,
					userId: "anonymous",
				}),
			});

			if (!response.ok) throw new Error("Failed to send message");

			setStatus("success");
			setMessage("");
			setEmail("");
		} catch (error) {
			console.error("Support email error:", error);
			setStatus("error");
			setErrorMessage("There was an error sending your message. Please try again.");
		}
	};

	return (
		<div className="bg-[var(--color-card)] flex flex-col items-center justify-center p-4">
			<div className="max-w-md w-full bg-[var(--color-card)] rounded-lg shadow p-8">
				<h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Contact Support</h1>

				{status === "success" && (
					<InlineAlert variant="positive">
						<Heading>Support Email Sent</Heading>
						<Content>Your support email has been sent successfully. We will respond to your inquiry as soon as possible.</Content>
					</InlineAlert>
				)}

				{status === "error" && (
					<InlineAlert variant="negative">
						<Heading>Error</Heading>
						<Content>{errorMessage}</Content>
					</InlineAlert>
				)}

				<form onSubmit={handleSubmit} className="space-y-4 pt-4">
					<div>
						<Picker label="Subject" isRequired necessityIndicator="icon" selectedKey={subject} onSelectionChange={(s) => setSubject(s as string)}>
							{supportSubjects.map((s) => (
								<Item key={s}>{s}</Item>
							))}
						</Picker>
					</div>

					<div>
						<TextField
							label="Email"
							type="email"
							isRequired
							necessityIndicator="icon"
							value={email}
							onChange={handleEmailChange}
							validationState={email ? (isEmailValid ? "valid" : "invalid") : undefined}
							maxWidth="100%"
							description="We'll use this to get back to you"
						/>
					</div>

					<div className="min-h-[300px]">
						<TextArea
							id="support-message"
							label="Message"
							isRequired
							necessityIndicator="icon"
							minLength={1}
							value={message}
							onChange={setMessage}
							maxWidth="100%"
							minWidth="100%"
							height="100%"
							minHeight="100%"
							maxHeight="100%"
							description="Please describe your issue..."
						/>
					</div>

					<button
						type="submit"
						disabled={status === "sending" || !isEmailValid || !message.trim()}
						className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-button-primary-bg)] hover:bg-[var(--color-button-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-button-primary-bg)] disabled:opacity-50">
						{status === "sending" ? "Sending..." : "Send Message"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default SupportPage;
