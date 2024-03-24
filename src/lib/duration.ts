export class Duration {
	public static seconds(count: number) {
		return count * 1000;
	}

	public static minutes(count: number) {
		return count * 60 * 1000;
	}

	public static hours(count: number) {
		return count * 60 * 60 * 1000;
	}

	public static days(count: number) {
		return count * 24 * 60 * 60 * 1000;
	}
}
