import { TextField } from "@adobe/react-spectrum";
import { useEffect } from "react";

interface RuleIdSearchProps {
	searchValue: string;
	setSearchValue: (value: string) => void;
}

const RuleIdSearch = ({ searchValue, setSearchValue }: RuleIdSearchProps) => {
	const handleChange = (value: string) => {
		setSearchValue(value);
	};

	// Clear search on unmount
	useEffect(() => {
		return () => {
			setSearchValue("");
		};
	}, [setSearchValue]);

	return (
		<div>
			<TextField
				label="Rule ID"
				value={searchValue}
				onChange={handleChange}
				placeholder="Enter rule ID (e.g., RL23c2576642ee4875b81bf449f5fa55a2)"
				width="100%"
			/>
		</div>
	);
};

export default RuleIdSearch;
