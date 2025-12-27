import { supabase } from '@/integrations/supabase/client';
import { Architecture, ArchitectureResult } from '@/types/architecture';

// Type assertion for new table not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface ArchitectureVersion {
    id: string;
    architecture_id: string;
    version_number: number;
    name: string;
    snapshot: ArchitectureVersionSnapshot;
    change_summary: string | null;
    created_at: string;
    created_by: string | null;
}

export interface ArchitectureVersionSnapshot {
    architecture: Architecture;
    mermaidDiagram?: string;
    requirements?: Record<string, unknown>;
}

export interface VersionDiff {
    added: string[];
    removed: string[];
    modified: string[];
    summary: string;
}

/**
 * Create a new version snapshot of an architecture
 */
export async function createVersion(
    architectureId: string,
    name: string,
    snapshot: ArchitectureVersionSnapshot,
    changeSummary?: string
): Promise<ArchitectureVersion | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User must be authenticated to create versions');
    }

    // Get next version number
    const { data: existingVersions } = await db
        .from('architecture_versions')
        .select('version_number')
        .eq('architecture_id', architectureId)
        .order('version_number', { ascending: false })
        .limit(1);

    const nextVersionNumber = existingVersions && existingVersions.length > 0
        ? (existingVersions[0] as any).version_number + 1
        : 1;

    const { data, error } = await db
        .from('architecture_versions')
        .insert({
            architecture_id: architectureId,
            version_number: nextVersionNumber,
            name,
            snapshot: snapshot as unknown as Record<string, unknown>,
            change_summary: changeSummary || null,
            created_by: user.id
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating version:', error);
        throw new Error(error.message);
    }

    return data as unknown as ArchitectureVersion;
}

/**
 * Get all versions for an architecture
 */
export async function getVersionHistory(architectureId: string): Promise<ArchitectureVersion[]> {
    const { data, error } = await db
        .from('architecture_versions')
        .select('*')
        .eq('architecture_id', architectureId)
        .order('version_number', { ascending: false });

    if (error) {
        console.error('Error fetching version history:', error);
        throw new Error(error.message);
    }

    return (data || []) as unknown as ArchitectureVersion[];
}

/**
 * Get a specific version
 */
export async function getVersion(versionId: string): Promise<ArchitectureVersion | null> {
    const { data, error } = await db
        .from('architecture_versions')
        .select('*')
        .eq('id', versionId)
        .single();

    if (error) {
        console.error('Error fetching version:', error);
        return null;
    }

    return data as unknown as ArchitectureVersion;
}

/**
 * Compare two versions and generate a diff
 */
export function compareVersions(v1: ArchitectureVersion, v2: ArchitectureVersion): VersionDiff {
    const diff: VersionDiff = {
        added: [],
        removed: [],
        modified: [],
        summary: ''
    };

    const arch1 = v1.snapshot.architecture;
    const arch2 = v2.snapshot.architecture;

    // Compare components
    const components1 = new Map(arch1.components.map(c => [c.name, c]));
    const components2 = new Map(arch2.components.map(c => [c.name, c]));

    // Find added components
    for (const [name] of components2) {
        if (!components1.has(name)) {
            diff.added.push(`Component: ${name}`);
        }
    }

    // Find removed components
    for (const [name] of components1) {
        if (!components2.has(name)) {
            diff.removed.push(`Component: ${name}`);
        }
    }

    // Find modified components
    for (const [name, comp1] of components1) {
        const comp2 = components2.get(name);
        if (comp2) {
            // Check if service type changed
            if (comp1.serviceType !== comp2.serviceType) {
                diff.modified.push(`${name}: service type changed from ${comp1.serviceType} to ${comp2.serviceType}`);
            }

            // Check if costs changed significantly (>10%)
            const providers = ['aws', 'azure', 'gcp', 'oci'] as const;
            for (const provider of providers) {
                const cost1 = comp1.providers[provider]?.monthlyCost || 0;
                const cost2 = comp2.providers[provider]?.monthlyCost || 0;
                if (cost1 > 0 && Math.abs(cost2 - cost1) / cost1 > 0.1) {
                    diff.modified.push(`${name}: ${provider.toUpperCase()} cost changed from $${cost1} to $${cost2}`);
                }
            }
        }
    }

    // Compare total costs
    const providers = ['aws', 'azure', 'gcp', 'oci'] as const;
    for (const provider of providers) {
        const total1 = arch1.totalCosts[provider];
        const total2 = arch2.totalCosts[provider];
        if (Math.abs(total2 - total1) > 10) {
            diff.modified.push(`Total ${provider.toUpperCase()} cost: $${total1} → $${total2}`);
        }
    }

    // Generate summary
    const changes = diff.added.length + diff.removed.length + diff.modified.length;
    if (changes === 0) {
        diff.summary = 'No significant changes between versions';
    } else {
        const parts = [];
        if (diff.added.length > 0) parts.push(`${diff.added.length} added`);
        if (diff.removed.length > 0) parts.push(`${diff.removed.length} removed`);
        if (diff.modified.length > 0) parts.push(`${diff.modified.length} modified`);
        diff.summary = `${changes} change${changes > 1 ? 's' : ''}: ${parts.join(', ')}`;
    }

    return diff;
}

/**
 * Delete a version
 */
export async function deleteVersion(versionId: string): Promise<boolean> {
    const { error } = await db
        .from('architecture_versions')
        .delete()
        .eq('id', versionId);

    if (error) {
        console.error('Error deleting version:', error);
        return false;
    }

    return true;
}

/**
 * Create a version from an ArchitectureResult
 */
export async function saveArchitectureVersion(
    architectureId: string,
    result: ArchitectureResult,
    selectedVariant: number,
    name: string,
    changeSummary?: string
): Promise<ArchitectureVersion | null> {
    const snapshot: ArchitectureVersionSnapshot = {
        architecture: result.architectures[selectedVariant],
        mermaidDiagram: result.mermaidDiagram
    };

    return createVersion(architectureId, name, snapshot, changeSummary);
}
