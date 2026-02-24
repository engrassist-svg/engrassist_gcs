import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/Colors';
import {
  TOOLS, DISCIPLINES, getToolsByDiscipline, getSubCategories,
} from '@/constants/Tools';
import type { Tool, Discipline, DisciplineInfo } from '@/constants/Tools';

type FilterOption = 'all' | Discipline;

export default function ToolsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const visibleDisciplines: DisciplineInfo[] =
    activeFilter === 'all'
      ? DISCIPLINES
      : DISCIPLINES.filter((d) => d.id === activeFilter);

  function handleToolPress(tool: Tool) {
    if (tool.status === 'available' && tool.route) {
      router.push(tool.route as any);
    } else if (tool.status === 'web_only' && tool.webUrl) {
      Linking.openURL(tool.webUrl);
    }
    // coming_soon tools do nothing on press
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Calculators</Text>
        <Text style={styles.pageSubtitle}>MEP field design tools</Text>

        {/* ── Legend ────────────────────────────── */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.available }]} />
            <Text style={styles.legendText}>In-App</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="globe-outline" size={12} color={Colors.info} />
            <Text style={styles.legendText}>Opens Website</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="lock-closed" size={12} color={Colors.textTertiary} />
            <Text style={styles.legendText}>Coming Soon</Text>
          </View>
        </View>

        {/* ── Filter Pills ─────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          <FilterPill label="All" active={activeFilter === 'all'} onPress={() => setActiveFilter('all')} />
          {DISCIPLINES.map((disc) => (
            <FilterPill key={disc.id} label={disc.name} active={activeFilter === disc.id} onPress={() => setActiveFilter(disc.id)} />
          ))}
        </ScrollView>

        {/* ── Tool Groups ──────────────────────── */}
        {visibleDisciplines.map((disc) => {
          const subCats = getSubCategories(disc.id);
          return (
            <View key={disc.id} style={styles.disciplineGroup}>
              {/* Discipline header */}
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: disc.color }]} />
                <Text style={[styles.sectionTitle, { color: disc.color }]}>{disc.name.toUpperCase()}</Text>
              </View>

              {/* Subcategory groups */}
              {subCats.map((cat) => {
                const tools = TOOLS.filter(t => t.discipline === disc.id && t.subCategory === cat);
                return (
                  <View key={cat} style={styles.subCatGroup}>
                    <Text style={styles.subCatTitle}>{cat}</Text>
                    {tools.map((tool) => (
                      <TouchableOpacity
                        key={tool.id}
                        style={[styles.toolCard, tool.status === 'coming_soon' && styles.toolCardDisabled]}
                        activeOpacity={tool.status === 'coming_soon' ? 1 : 0.7}
                        onPress={() => handleToolPress(tool)}
                      >
                        <View style={[styles.toolIconBox, {
                          backgroundColor: tool.status === 'coming_soon' ? Colors.surfaceLight : disc.color + '20',
                        }]}>
                          <Ionicons
                            name={tool.icon as any}
                            size={20}
                            color={tool.status === 'coming_soon' ? Colors.textTertiary : disc.color}
                          />
                        </View>
                        <View style={styles.toolContent}>
                          <View style={styles.toolNameRow}>
                            <Text style={[styles.toolName, tool.status === 'coming_soon' && styles.toolNameDim]}>
                              {tool.name}
                            </Text>
                            {/* Status badge */}
                            {tool.status === 'coming_soon' && (
                              <View style={styles.badgeSoon}>
                                <Ionicons name="lock-closed" size={10} color={Colors.textTertiary} />
                                <Text style={styles.badgeSoonText}>Soon</Text>
                              </View>
                            )}
                            {tool.status === 'web_only' && (
                              <View style={styles.badgeWeb}>
                                <Ionicons name="globe-outline" size={10} color={Colors.info} />
                                <Text style={styles.badgeWebText}>Web</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.toolDesc}>{tool.description}</Text>
                        </View>
                        {tool.status === 'available' && (
                          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                        )}
                        {tool.status === 'web_only' && (
                          <Ionicons name="open-outline" size={16} color={Colors.info} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.pill, active && styles.pillActive]} activeOpacity={0.7} onPress={onPress}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  pageTitle: { fontSize: FontSizes.hero, fontWeight: '800', color: Colors.textPrimary, marginTop: Spacing.xxxl },
  pageSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.lg },

  // Legend
  legendRow: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSizes.xs, color: Colors.textTertiary },

  // Filters
  filterScroll: { marginBottom: Spacing.xxl },
  filterRow: { flexDirection: 'row', gap: Spacing.sm },
  pill: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.surfaceBorder },
  pillActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  pillText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  pillTextActive: { color: Colors.primary, fontWeight: '600' },

  // Groups
  disciplineGroup: { marginBottom: Spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '700', letterSpacing: 3 },
  subCatGroup: { marginBottom: Spacing.lg },
  subCatTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm, marginLeft: Spacing.xs },

  // Cards
  toolCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.surfaceBorder, padding: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.md },
  toolCardDisabled: { opacity: 0.5 },
  toolIconBox: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  toolContent: { flex: 1 },
  toolNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  toolName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  toolNameDim: { color: Colors.textSecondary },
  toolDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18 },

  // Badges
  badgeSoon: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLight },
  badgeSoonText: { fontSize: FontSizes.xs, color: Colors.textTertiary, fontWeight: '600' },
  badgeWeb: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full, backgroundColor: Colors.info + '15' },
  badgeWebText: { fontSize: FontSizes.xs, color: Colors.info, fontWeight: '600' },
});
