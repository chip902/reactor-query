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
		<div className="p-2 bg-white rounded-lg shadow relative h-full flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
				<div className="space-x-2">
					<button
						onClick={(e: React.MouseEvent) => {
							e.preventDefault();
							onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
						}}
						className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
						Previous
					</button>
					<button
						onClick={(e: React.MouseEvent) => {
							e.preventDefault();
							onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
						}}
						className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
						Next
					</button>
				</div>
			</div>

			<div className="grid grid-cols-7 gap-0.5 flex-1" style={{ gridTemplateRows: "auto repeat(6, minmax(0, 1fr))" }}>
				{weekdays.map((day) => (
					<div key={day} className="text-center text-xs font-medium text-gray-500 py-0.5">
						{day}
					</div>
				))}
				{emptyCells.map((_, index) => (
					<div key={`empty-${index}`} className="w-full h-14 p-1 text-center border border-gray-200 bg-gray-50" />
				))}
				{daysInMonth.map((day, index) => {
					const hasPublishedItem = publishedDates.some((date) => isSameDay(date, day));
					const isToday = isSameDay(day, new Date());

					return (
						<div
							key={index}
							className={`
                w-full h-14 p-1 text-center border flex flex-col justify-between text-xs
                ${isSameMonth(day, monthStart) ? "bg-white" : "bg-gray-50"}
                ${hasPublishedItem ? "border-green-500 bg-blue-50" : "border-gray-200"}
                ${isToday ? "font-bold bg-blue-200" : ""}
              `}>
							<div className="flex flex-col items-center h-full">
								<span className="text-xs">{format(day, "d")}</span>
								{hasPublishedItem && (
									<div className="flex items-center gap-1 mt-1">
										<span className="text-xs text-gray-500">{publishedDates.filter((date) => isSameDay(date, day)).length}x</span>
										<div className="w-2 h-2 bg-green-600 rounded-full" />
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
