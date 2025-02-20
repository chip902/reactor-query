import { IllustratedMessage, Heading, Content } from "@adobe/react-spectrum";
import Data from '@spectrum-icons/workflow/Data';

const SelectARule = () => {
    return (
        <IllustratedMessage>
            <Data />
            <Heading>Select a Rule</Heading>
            <Content>Select a rule to view its data element usages.</Content>
        </IllustratedMessage>
    );
}

export default SelectARule;