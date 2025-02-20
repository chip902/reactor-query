import { IllustratedMessage, Heading, Content } from "@adobe/react-spectrum";
import DataUnavailable from '@spectrum-icons/workflow/DataUnavailable';

const NoResultsMessage = ({ searchValue, searchType }: { searchValue: string, searchType: string }) => {
    return (
        <IllustratedMessage>
            <DataUnavailable />
            <Heading>No {searchType}</Heading>
            {searchType == 'data elements' && (
                <Content>No Data Elements found in &quot;{searchValue}&quot;.</Content>
            )}
            {searchType == 'rules' && (
                <Content>No Rules use the &quot;{searchValue}&quot; Data Element.</Content>
            )}

        </IllustratedMessage>
    );
}

export default NoResultsMessage;