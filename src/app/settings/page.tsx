'use client';
import SettingsForm from "@/components/forms/SettingsForm";

import YoutubeEmbed from "@/components/YoutubeEmbed";


const SettingsPage = () => {
    return (
        <>
            <SettingsForm />
            <div className="p-4 mt-8">
                <div className="max-w-[640px]">
                    <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">How to create your API keys</h2>
                    <YoutubeEmbed videoId="5s65A_JFld8" title="Settings Video" />
                </div>


            </div>
        </>
    );
}

export default SettingsPage;