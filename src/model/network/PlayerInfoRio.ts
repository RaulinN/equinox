/** Interface that represents data from a successful RaiderIO player information fetch */
export interface PlayerInfoRio {
    name: string,
    race: string,
    class: string,
    active_spec_name: string,
    active_spec_role: string,
    faction: string,
    achievement_points: number,
    thumbnail_url: string,
    region: string,
    realm: string,
    profile_url: string,
    gear: any,
    mythic_plus_scores_by_season: {
        season: string,
        scores: any,
        segments: any,
    }[],
    raid_progression: any,
    guild: {
        name: string,
        realm: string,
    },
}
