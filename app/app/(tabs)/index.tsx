import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/Colors';
import {
  TOOLS, DISCIPLINES, getAvailableTools, getStats,
  getDisciplineToolCount, WEBSITE_LINKS,
} from '@/constants/Tools';
import type { Tool, DisciplineInfo } from '@/constants/Tools';

export default function HomeScreen() {
  const router = useRouter();
  const stats = getStats();
  const availableTools = getAvailableTools();

  function handleToolPress(tool: Tool) {
    if (tool.status === 'available' && tool.route) {
      router.push(tool.route as any);
    } else if (tool.status === 'web_only' && tool.webUrl) {
      Linking.openURL(tool.webUrl);
    }
  }

  function handleDisciplinePress(disc: DisciplineInfo) {
    router.push('/(tabs)/tools');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Logo & Header ────────────────────── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <View style={styles.logoStripes}>
                <View style={[styles.stripe, { backgroundColor: '#1a3055' }]} />
                <View style={[styles.stripe, { backgroundColor: '#1a3055' }]} />
                <View style={[styles.stripe, { backgroundColor: '#1a3055' }]} />
              </View>
              <View style={styles.logoDot} />
            </View>
            <View>
              <Text style={styles.brandLabel}>ENGINEERING</Text>
              <Text style={styles.brandName}>ASSIST</Text>
            </View>
          </View>
          <View style={styles.subtitleBadge}>
            <Text style={styles.subtitleText}>MEP Field Tools</Text>
          </View>
        </View>

        {/* ── Stats ────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.available}</Text>
            <Text style={styles.statLabel}>In-App</Text>
          </View>
          <View style={[styles.statCard, styles.statCardAccent]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Tools</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.disciplines}</Text>
            <Text style={styles.statLabel}>Disciplines</Text>
          </View>
        </View>

        {/* ── Ready to Use (in-app calculators) ── */}
        <Text style={styles.sectionLabel}>CALCULATORS</Text>
        {availableTools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.toolCard}
            activeOpacity={0.7}
            onPress={() => handleToolPress(tool)}
          >
            <View style={[styles.toolIconBox, { backgroundColor: Colors.surfaceLight }]}>
              <Ionicons name={tool.icon as any} size={22} color={Colors.mechanical} />
            </View>
            <View style={styles.toolCardContent}>
              <Text style={styles.toolName}>{tool.name}</Text>
              <Text style={styles.toolDesc}>{tool.description}</Text>
              <View style={styles.tagRow}>
                {tool.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.arrowBox}>
              <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        ))}

        {/* ── Disciplines ──────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.xxxl }]}>DISCIPLINES</Text>
        {DISCIPLINES.map((disc) => (
          <TouchableOpacity
            key={disc.id}
            style={styles.disciplineCard}
            activeOpacity={0.7}
            onPress={() => handleDisciplinePress(disc)}
          >
            <View style={[styles.disciplineIcon, { backgroundColor: disc.color + '20' }]}>
              <Ionicons name={disc.icon as any} size={22} color={disc.color} />
            </View>
            <View style={styles.disciplineContent}>
              <Text style={styles.disciplineName}>{disc.name}</Text>
              <Text style={styles.disciplineDesc}>{disc.description}</Text>
            </View>
            <View style={styles.disciplineCount}>
              <Text style={styles.disciplineCountNum}>{getDisciplineToolCount(disc.id)}</Text>
              <Text style={styles.disciplineCountLabel}>tools</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* ── Website Link ─────────────────────── */}
        <TouchableOpacity
          style={styles.webBanner}
          activeOpacity={0.7}
          onPress={() => Linking.openURL(WEBSITE_LINKS.home)}
        >
          <Ionicons name="globe-outline" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.webBannerTitle}>Visit EngrAssist.com</Text>
            <Text style={styles.webBannerSub}>Full reference guides, design resources & more tools</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        {/* ── Footer ───────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>EngrAssist.com</Text>
          <Text style={styles.footerTagline}>Built for field engineers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  header: { marginTop: Spacing.xxxl, marginBottom: Spacing.xxl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  logoStripes: { position: 'absolute', top: 8, left: 6, right: 6, gap: 4 },
  stripe: { height: 3, borderRadius: 1 },
  logoDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, position: 'absolute', bottom: 8, right: 8 },
  brandLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, letterSpacing: 3, fontWeight: '400' },
  brandName: { fontSize: FontSizes.xxl, color: Colors.textPrimary, fontWeight: '800', letterSpacing: 1 },
  subtitleBadge: { marginTop: Spacing.md, alignSelf: 'flex-start', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary },
  subtitleText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxxl },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.surfaceBorder, padding: Spacing.lg, alignItems: 'center' },
  statCardAccent: { borderColor: Colors.primary + '40' },
  statNumber: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: Spacing.xs },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary, letterSpacing: 3, fontWeight: '600', marginBottom: Spacing.lg },
  toolCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.surfaceBorder, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.md },
  toolIconBox: { width: 44, height: 44, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  toolCardContent: { flex: 1 },
  toolName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  toolDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.sm },
  tagRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  tag: { paddingHorizontal: Spacing.md, paddingVertical: 3, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLight },
  tagText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '500' },
  arrowBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  disciplineCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.surfaceBorder, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.md },
  disciplineIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  disciplineContent: { flex: 1 },
  disciplineName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  disciplineDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  disciplineCount: { alignItems: 'center', marginRight: Spacing.sm },
  disciplineCountNum: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary },
  disciplineCountLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  webBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.primary + '30', padding: Spacing.lg, marginTop: Spacing.xxxl },
  webBannerTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.primary },
  webBannerSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  footer: { alignItems: 'center', marginTop: Spacing.xxl, paddingVertical: Spacing.xxl },
  footerBrand: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '600' },
  footerTagline: { fontSize: FontSizes.sm, color: Colors.textTertiary, marginTop: 4 },
});
