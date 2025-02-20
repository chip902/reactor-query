import { Item, Picker } from "@adobe/react-spectrum";
import { TruncatedReactorAPIResponseItem } from "@/lib/types";

interface CompanyPickerProps {
    companies: TruncatedReactorAPIResponseItem[],
    companiesLoading: boolean,
    selectedCompany: { id: string; name: string },
    setSelectedCompany: React.Dispatch<React.SetStateAction<{ id: string; name: string }>>
}
const CompanyPicker = ({ companies, companiesLoading, selectedCompany, setSelectedCompany }: CompanyPickerProps) => {
    return (
        <Picker
            label="Company"
            selectedKey={selectedCompany.id}
            onSelectionChange={(key) => {
                const company = companies.find(c => c.id === key);
                setSelectedCompany(company ? { id: company.id, name: company.attributes.name } : { id: '', name: '' });
            }}
            placeholder={companiesLoading ? 'Loading...' : 'Select a company'}
            UNSAFE_className='w-full flex-1'
            isRequired
            isDisabled={companiesLoading}
        >
            {companies.map((company) => (
                <Item key={company.id} textValue={company.attributes.name}>
                    {company.attributes.name}
                </Item>
            ))}
        </Picker>
    )
}

export default CompanyPicker;