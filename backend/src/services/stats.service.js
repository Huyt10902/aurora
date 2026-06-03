export class StatsService {
	constructor({ statsRepository }) {
		this.statsRepository = statsRepository;
	}

	async getDashboardStats() {
		const stats = await this.statsRepository.getDashboardStats();
		return {
			totalAlbums: stats.total_albums,
			totalSongs: stats.total_songs,
			totalUsers: stats.total_users,
			totalArtists: stats.total_artists,
			totalPlays: stats.total_plays,
		};
	}
}
