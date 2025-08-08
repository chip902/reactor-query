"use client";

import { ReactorQueryApplet } from "@/components/ReactorQueryApplet";

export default function BulkEditPage() {
	return (
		<ReactorQueryApplet 
			title="Adobe Launch Tools"
			maxHeight="90vh"
			initialView="bulk-edit"
		/>
	);
}
