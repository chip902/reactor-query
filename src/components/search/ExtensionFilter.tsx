import {
    Flex,
    Item,
    Picker,
    Text,
} from "@adobe/react-spectrum";

import { TruncatedReactorAPIResponseItem } from "@/lib/types";

interface Extension {
    id: string;
    display_name: string;
    name: string;
}

interface ExtensionFilterProps {
    extensions: TruncatedReactorAPIResponseItem[];
    extensionsLoading: boolean;
    selectedExtension: Extension;
    setSelectedExtension: (extension: Extension) => void;
    selectedProperty: { id: string; name: string };
}

const ExtensionFilter = ({ extensions, extensionsLoading, selectedExtension, setSelectedExtension, selectedProperty }: ExtensionFilterProps) => {
    return (
        <Flex direction="column" gap="size-100" marginBottom="size-200" marginTop='size-200'>
            <Text>Select an Extension to view all the rules and data elements that use it.</Text>
            <Picker
                label="Extension"
                selectedKey={selectedExtension.id}
                onSelectionChange={(key) => {
                    const extension = extensions.find(p => p.id === key);
                    setSelectedExtension(extension ? { id: extension.id, name: extension.attributes.name, display_name: extension.attributes.display_name ?? '' } : { id: '', name: '', display_name: '' });
                }}
                placeholder="Select an Extension"
                UNSAFE_className='flex-1'
                UNSAFE_style={{ width: '50%' }}
                isRequired
                isDisabled={!selectedProperty.id || extensionsLoading}
            >
                {extensions.map((extension) => (
                    <Item key={extension.id} textValue={extension.attributes.display_name}>
                        {extension.attributes.display_name}
                    </Item>
                ))}
            </Picker>
        </Flex>
    );
};

export default ExtensionFilter;