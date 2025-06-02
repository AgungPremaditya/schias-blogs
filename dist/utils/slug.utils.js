"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = generateSlug;
exports.findUniqueSlug = findUniqueSlug;
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
async function findUniqueSlug(supabaseService, tableName, baseSlug) {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const { data, error } = await supabaseService
            .getClient()
            .from(tableName)
            .select('id')
            .eq('slug', slug)
            .single();
        if (error && error.code === 'PGRST116') {
            return slug;
        }
        if (error)
            throw error;
        counter++;
        slug = `${baseSlug}-${counter}`;
    }
}
//# sourceMappingURL=slug.utils.js.map