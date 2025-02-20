import { IllustratedMessage, Heading, Content } from "@adobe/react-spectrum";
import Alert from '@spectrum-icons/workflow/Alert';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
    if (!message) return null;
    
    return (
        <IllustratedMessage>
            <Alert color="negative" />
            <Heading>Error</Heading>
            <Content>{message}</Content>
        </IllustratedMessage>
    );
};

export default ErrorMessage;
