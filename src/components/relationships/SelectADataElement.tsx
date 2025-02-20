import { IllustratedMessage, Heading, Content } from "@adobe/react-spectrum";
import Hammer from '@spectrum-icons/workflow/Hammer';

const SelectADataElement = () => {
    return (
        <IllustratedMessage>
            <Hammer />
            <Heading>Select a Data Element</Heading>
            <Content>Select a data element to view its rule usages.</Content>
        </IllustratedMessage>
    );
}

export default SelectADataElement;