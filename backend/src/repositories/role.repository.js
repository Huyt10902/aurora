import { BaseRepository } from "./base.repository.js";

export class RoleRepository extends BaseRepository {
	findByCode(code) {
		return this.one("SELECT * FROM roles WHERE code = $1", [code]);
	}
}
