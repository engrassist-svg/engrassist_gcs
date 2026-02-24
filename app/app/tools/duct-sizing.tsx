import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/Colors';
import {
  calculateDuct, DUCT_MATERIALS,
  type DuctInputs, type DuctResults,
} from '@/utils/calculations';

/**
 * Duct Sizing Calculator Screen
 * 
 * Ported from EngrAssist.com's ductulator. Provides:
 * - CFM input
 * - Friction rate input (in. w.g. / 100 ft)
 * - Material selection
 * - Round + rectangular results with equivalents
 * - Velocity, friction factor, Reynolds number
 */

type CalcMode = 'size-from-friction' | 'friction-from-size';

export default function DuctSizingScreen() {
  const [mode, setMode] = useState<CalcMode>('size-from-friction');
  const [cfm, setCfm] = useState('');
  const [frictionRate, setFrictionRate] = useState('0.08');
  const [diameter, setDiameter] = useState('');
  const [material, setMaterial] = useState('galvanized');
  const [results, setResults] = useState<DuctResults | null>(null);
  const [showMaterials, setShowMaterials] = useState(false);

  const calculate = useCallback(() => {
    const cfmVal = parseFloat(cfm);
    if (isNaN(cfmVal) || cfmVal <= 0) return;

    const inputs: DuctInputs = {
      cfm: cfmVal,
      ductShape: 'round',
      material,
    };

    if (mode === 'size-from-friction') {
      const fr = parseFloat(frictionRate);
      if (isNaN(fr) || fr <= 0) return;
      inputs.frictionRate = fr;
    } else {
      const d = parseFloat(diameter);
      if (isNaN(d) || d <= 0) return;
      inputs.diameter = d;
    }

    const result = calculateDuct(inputs);
    setResults(result);
  }, [cfm, frictionRate, diameter, material, mode]);

  const clearAll = () => {
    setCfm('');
    setFrictionRate('0.08');
    setDiameter('');
    setResults(null);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Duct Sizing',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.textPrimary,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Mode Toggle ──────────────────── */}
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'size-from-friction' && styles.modeBtnActive]}
                onPress={() => { setMode('size-from-friction'); setResults(null); }}
              >
                <Text style={[styles.modeBtnText, mode === 'size-from-friction' && styles.modeBtnTextActive]}>
                  Size from Friction
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'friction-from-size' && styles.modeBtnActive]}
                onPress={() => { setMode('friction-from-size'); setResults(null); }}
              >
                <Text style={[styles.modeBtnText, mode === 'friction-from-size' && styles.modeBtnTextActive]}>
                  Friction from Size
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Inputs ───────────────────────── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Inputs</Text>

              <InputField
                label="Airflow (CFM)"
                value={cfm}
                onChangeText={setCfm}
                placeholder="e.g. 1200"
                keyboardType="decimal-pad"
              />

              {mode === 'size-from-friction' ? (
                <InputField
                  label='Friction Rate (in. w.g. / 100 ft)'
                  value={frictionRate}
                  onChangeText={setFrictionRate}
                  placeholder="0.08"
                  keyboardType="decimal-pad"
                />
              ) : (
                <InputField
                  label="Round Duct Diameter (inches)"
                  value={diameter}
                  onChangeText={setDiameter}
                  placeholder="e.g. 18"
                  keyboardType="decimal-pad"
                />
              )}

              {/* Material selector */}
              <Text style={styles.inputLabel}>Duct Material</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowMaterials(!showMaterials)}
              >
                <Text style={styles.selectorText}>
                  {DUCT_MATERIALS[material]?.name ?? 'Galvanized Steel'}
                </Text>
                <Ionicons
                  name={showMaterials ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {showMaterials && (
                <View style={styles.dropdown}>
                  {Object.entries(DUCT_MATERIALS).map(([key, mat]) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.dropdownItem, key === material && styles.dropdownItemActive]}
                      onPress={() => { setMaterial(key); setShowMaterials(false); }}
                    >
                      <Text style={[
                        styles.dropdownText,
                        key === material && styles.dropdownTextActive,
                      ]}>
                        {mat.name}
                      </Text>
                      <Text style={styles.dropdownSub}>
                        ε = {mat.roughness} ft
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* ── Action Buttons ────────────────── */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.calcBtn} onPress={calculate} activeOpacity={0.7}>
                <Ionicons name="calculator" size={18} color={Colors.textOnPrimary} />
                <Text style={styles.calcBtnText}>Calculate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.7}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* ── Results ──────────────────────── */}
            {results && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Results</Text>

                <ResultRow label="Round Duct Diameter" value={`${results.standardDiameter}"`} highlight />
                <ResultRow label="Calculated Diameter" value={`${results.diameter}"`} />
                <ResultRow label="Velocity" value={`${results.velocity.toLocaleString()} FPM`} />
                <ResultRow label="Friction Rate" value={`${results.frictionRate} in.w.g./100ft`} />
                <ResultRow label="Cross-Sectional Area" value={`${results.area} ft²`} />
                <ResultRow label="Velocity Pressure" value={`${results.velocityPressure} in.w.g.`} />
                <ResultRow label="Reynolds Number" value={results.reynoldsNumber.toLocaleString()} />
                <ResultRow label="Friction Factor" value={`${results.frictionFactor}`} />

                {/* Rectangular equivalents */}
                {results.rectangularOptions && results.rectangularOptions.length > 0 && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.subTitle}>Rectangular Equivalents</Text>
                    {results.rectangularOptions.map((opt, i) => (
                      <ResultRow
                        key={i}
                        label={`Option ${i + 1}`}
                        value={`${opt.width}" × ${opt.height}"  (${(opt.width / opt.height).toFixed(1)}:1)`}
                        highlight={i === 0}
                      />
                    ))}
                  </>
                )}
              </View>
            )}

            {/* ── Disclaimer ──────────────────── */}
            <View style={styles.disclaimer}>
              <Ionicons name="warning" size={16} color={Colors.warning} />
              <Text style={styles.disclaimerText}>
                For educational reference only. All calculations must be verified
                by a licensed professional engineer per ASHRAE and SMACNA standards.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// ─── Reusable Components ─────────────────────────

function InputField({
  label, value, onChangeText, placeholder, keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'decimal-pad' | 'number-pad';
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        keyboardType={keyboardType ?? 'decimal-pad'}
        returnKeyType="done"
      />
    </View>
  );
}

function ResultRow({
  label, value, highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={[styles.resultValue, highlight && styles.resultHighlight]}>
        {value}
      </Text>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 60,
  },

  // Mode toggle
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  modeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  modeBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  modeBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },

  // Inputs
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },

  // Material selector
  selector: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  dropdown: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemActive: {
    backgroundColor: Colors.primary + '15',
  },
  dropdownText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  dropdownTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dropdownSub: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  calcBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  calcBtnText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  clearBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Results
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder + '40',
  },
  resultLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  resultValue: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
  },
  resultHighlight: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginVertical: Spacing.lg,
  },
  subTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.warning + '10',
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    marginTop: Spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
