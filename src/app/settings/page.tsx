'use client';

import { ReactorQueryApplet } from "@/components/ReactorQueryApplet";

export default function SettingsPage() {
    return (
        <ReactorQueryApplet 
            title="Adobe Launch Tools"
            maxHeight="90vh"
            initialView="settings"
        />
    );
}