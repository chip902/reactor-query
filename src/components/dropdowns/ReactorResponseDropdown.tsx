import { TruncatedReactorAPIResponseItem } from '@/lib/types';
import { Picker, Item } from '@adobe/react-spectrum';

const ReactorResponseDropdown = ({
    responseItems,
    setItem,
    label,
    isLoading,
    isDisabled,
    selectedKey
}: {
    responseItems: TruncatedReactorAPIResponseItem[],
    selectedKey?: string
    label: string,
    isLoading?: boolean,
    isDisabled?: boolean
    setItem: React.Dispatch<React.SetStateAction<{ id: string; name: string }>>
}) => {
    return (
        <Picker width="100%" selectedKey={selectedKey} isLoading={isLoading} isDisabled={isDisabled} label={label} items={responseItems} onSelectionChange={(i) => {
            setItem({
                id: i as string,
                name: responseItems.find(resItem => resItem.id === i)?.attributes.name || ''
            });
        }}>
            {responseItems.map((i: TruncatedReactorAPIResponseItem) => (
                <Item key={i.id}>{i.attributes.name}</Item>
            ))}
        </Picker>
    )
};

export default ReactorResponseDropdown;