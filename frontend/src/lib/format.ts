export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const formatPlayCount = (count = 0) => {
	if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M plays`;
	if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K plays`;
	return `${count.toLocaleString()} ${count === 1 ? "play" : "plays"}`;
};

export const formatRating = (rating = 0) => {
	if (!rating) return "No ratings";
	return `${rating.toFixed(1)} / 5`;
};

export const formatDate = (value?: string | null) => {
	if (!value) return "Unknown";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Unknown";
	return new Intl.DateTimeFormat("en", {
		year: "numeric",
		month: "short",
		day: "2-digit",
	}).format(date);
};

export const formatPrice = (amount = 0, currency = "VND") => {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
};
