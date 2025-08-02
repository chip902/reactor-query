import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { MonthViewCalendarProps } from "@/lib/types";

export const MonthViewCalendar = ({ items, currentDate, onDateChange }: MonthViewCalendarProps) => {
	const monthStart = startOfMonth(currentDate);
	const monthEnd = endOfMonth(currentDate);
	const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

	// Get the day of week for the first day (0-6, 0 = Sunday)
	const firstDayOfWeek = monthStart.getDay();
	// Create empty cells for days before the first day of the month
	const emptyCells = Array(firstDayOfWeek).fill(null);

	const publishedDates = items.map((item) => {
		const date = new Date(item.attributes.published_at!);
		return date;
		// these are already returned with adjusted timezones based on browser settings
		// return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
	});

	const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	return (
		<div className="p-2 bg-[var(--color-card)] rounded-lg shadow relative h-full flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{format(currentDate, "MMMM yyyy")}</h2>
				<div className="space-x-2">
					<button
						onClick={(e: React.MouseEvent) => {
							e.preventDefault();
							onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
						}}
						className="px-3 py-1 text-sm bg-[var(--color-button-secondary-bg)] text-[var(--color-button-secondary-text)] rounded hover:bg-[var(--color-button-secondary-hover-bg)] hover:text-[var(--color-button-secondary-hover-text)]"
					>
						Previous
					</button>
					<button
						onClick={(e: React.MouseEvent) => {
							e.preventDefault();
							onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
						}}
						className="px-3 py-1 text-sm bg-[var(--color-button-secondary-bg)] text-[var(--color-button-secondary-text)] rounded hover:bg-[var(--color-button-secondary-hover-bg)] hover:text-[var(--color-button-secondary-hover-text)]"
					>
						Next
					</button>
				</div>
			</div>

			<div className="grid grid-cols-7 gap-0.5 flex-1" style={{ gridTemplateRows: "auto repeat(6, minmax(0, 1fr))" }}>
				{weekdays.map((day) => (
					<div key={day} className="text-center text-xs font-medium text-[var(--color-text-secondary)] py-0.5">
						{day}
					</div>
				))}
				{emptyCells.map((_, index) => (
					<div key={`empty-${index}`} className="w-full h-14 p-1 text-center border border-[var(--color-border)] bg-[var(--color-card-secondary)]" />
				))}
				{daysInMonth.map((day, index) => {
					const _hasPublishedItem = publishedDates.some((date) => isSameDay(date, day));
					const _isToday = isSameDay(day, new Date());

					return (
						<button
							key={index}
							className={`text-sm p-1 w-8 h-8 rounded-full ${isSameDay(day, new Date()) ? 'bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)]' : isSameMonth(day, monthStart) ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}
							onClick={(e: React.MouseEvent) => {
								e.preventDefault();
								onDateChange(day);
							}}
						>
							{format(day, "d")}
						</button>
					);
				})}
			</div>
		</div>
	);
};
