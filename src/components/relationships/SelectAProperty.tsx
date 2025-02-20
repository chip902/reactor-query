import { IllustratedMessage, Heading, Content } from "@adobe/react-spectrum";
import Hammer from '@spectrum-icons/workflow/Hammer';
import Data from '@spectrum-icons/workflow/Data';

const SelectAProperty = ({ searchType }: { searchType: 'data elements' | 'rules' }) => {
    return (
        <IllustratedMessage>
            {searchType == 'rules' && <Hammer />}
            {searchType == 'data elements' && <Data />}
            <Heading>Select a Property</Heading>
            <Content>Select a property to view its {searchType}.</Content>
        </IllustratedMessage>
    );
}

export default SelectAProperty;