import { Picker, Item } from '@adobe/react-spectrum';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';

interface PropertyPickerProps {
    selectedCompany: { id: string; name: string };
    selectedProperty: { id: string; name: string };
    properties: TruncatedReactorAPIResponseItem[];
    propertiesLoading: boolean;
    setSelectedProperty: (property: { id: string; name: string }) => void;
}

const PropertyPicker = ({
    selectedCompany,
    selectedProperty,
    properties,
    propertiesLoading,
    setSelectedProperty
}: PropertyPickerProps) => {
    return (
        <Picker
            label="Property"
            selectedKey={selectedProperty.id}
            onSelectionChange={(key) => {
                const property = properties.find(p => p.id === key);
                setSelectedProperty(property ? { id: property.id, name: property.attributes.name } : { id: '', name: '' });
            }}
            placeholder={propertiesLoading ? 'Loading...' : 'Select a property'}
            UNSAFE_className='w-full flex-1'
            isRequired
            isDisabled={!selectedCompany.id || propertiesLoading}
        >
            {properties.map((property) => (
                <Item key={property.id} textValue={property.attributes.name}>
                    {property.attributes.name}
                </Item>
            ))}
        </Picker>
    );
}

export default PropertyPicker;