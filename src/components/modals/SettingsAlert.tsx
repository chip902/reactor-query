import { InlineAlert, Heading, Content } from '@adobe/react-spectrum';
import Link from 'next/link';

const SettingsAlert = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
            <InlineAlert variant="info">
                <Heading>API Keys Needed</Heading>
                <Content>
                    You need to add your Launch API keys to use the app. Go to the {<Link className="underline text-[var(--color-link)] hover:text-[var(--color-link-hover)]" href="/settings">Settings</Link>} page to provide them.
                    <br /><br />
                    <small style={{ color: 'var(--color-text-secondary)' }}>
                        Note: API keys are stored in your browser&apos;s session storage and will be cleared when you close the browser.
                    </small>
                </Content>
            </InlineAlert>
        </div>
    )
}

export default SettingsAlert