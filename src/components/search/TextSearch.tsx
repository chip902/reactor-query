import {
    Content,
    ContextualHelp,
    Flex,
    Heading,
    Switch,
    SearchField,
    Text,
} from "@adobe/react-spectrum";

interface TextSearchProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    includeRevisionHistory: boolean;
    setIncludeRevisionHistory: (value: boolean) => void;
    includeDeletedItems: boolean;
    setIncludeDeletedItems: (value: boolean) => void;
}

const TextSearch = ({
    searchValue,
    setSearchValue,
    includeRevisionHistory,
    setIncludeRevisionHistory,
    includeDeletedItems,
    setIncludeDeletedItems,
}: TextSearchProps) => {
    return (
        <Flex direction="column" gap="size-100" marginBottom="size-200" marginTop='size-200'>
            <SearchField
                UNSAFE_className='flex-1'
                UNSAFE_style={{ width: '50%' }}
                label="Search"
                value={searchValue}
                onChange={setSearchValue}
                isRequired
                necessityIndicator="icon" />
            <Flex direction="row" gap="size-100">
                <Switch
                    UNSAFE_className='hover:cursor-pointer mt-6'
                    isSelected={includeRevisionHistory}
                    onChange={setIncludeRevisionHistory}
                >
                    Include revision history
                </Switch>
                <div style={{ display: 'inline', position: 'relative', right: '2.2em', top: '1.6em' }}>
                    <ContextualHelp variant="help">
                        <Heading>WARNING</Heading>
                        <Content>
                            <Text>
                                Checking this option will search the ENTIRE revision history of every rule, data element, and extension in your property.
                                You probably don&apos;t need to do this. If your search is failing, try unchecking this option.
                            </Text>
                        </Content>
                    </ContextualHelp>
                </div>
                <Switch
                    isSelected={includeDeletedItems}
                    onChange={setIncludeDeletedItems}
                    UNSAFE_className='hover:cursor-pointer mt-6'
                >
                    Include deleted items
                </Switch>
            </Flex>
        </Flex>
    )
}

export default TextSearch