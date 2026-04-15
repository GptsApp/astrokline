import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { UserProfile, DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#0A0A0F', color: '#ffffff', fontFamily: 'Helvetica' },
  coverPage: { padding: 40, backgroundColor: '#050508', color: '#ffffff', fontFamily: 'Helvetica', justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20, borderBottom: '1px solid #333', paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTextContainer: { flex: 1 },
  headerLogo: { width: 24, height: 24 },
  title: { fontSize: 18, color: '#D4AF37', marginBottom: 3, letterSpacing: 1 },
  subtitle: { fontSize: 8, color: '#888888', textTransform: 'uppercase', letterSpacing: 2 },
  section: { marginTop: 8, marginBottom: 8, padding: 14, backgroundColor: '#110F18', borderRadius: 4, borderLeft: '2px solid #555' },
  badge: { backgroundColor: '#1A1820', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 2, marginBottom: 6, alignSelf: 'flex-start', borderLeft: '3px solid #D4AF37' },
  badgeText: { fontSize: 8, color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  text: { fontSize: 9.5, lineHeight: 1.7, color: '#cccccc' },
  bold: { color: '#ffffff', fontWeight: 'bold' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#333', borderRightWidth: 0, borderBottomWidth: 0, marginTop: 10 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColH: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#333', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#1A1820', padding: 5 },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#333', borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  cellH: { margin: 'auto', fontSize: 8, fontWeight: 'bold', color: '#D4AF37' },
  cell: { margin: 'auto', fontSize: 8, color: '#bbb' },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: 8 },
  footerText: { color: '#444', fontSize: 7, textTransform: 'uppercase', letterSpacing: 1 },
  proto: { marginTop: 8, padding: 10, backgroundColor: '#050508', borderRadius: 2, borderTop: '1px solid #333' },
});

const renderRich = (text: string) => {
  if (!text) return null;
  return text.replace(/\\n/g, '\n').split('\n').map((p, i) => {
    if (!p.trim()) return null;
    if (p.startsWith('### ')) {
      return (
        <View key={i} style={{ marginTop: 12, marginBottom: 8, padding: 6, backgroundColor: '#1A1820', borderLeft: '3px solid #D4AF37' }}>
          <Text style={{ fontSize: 9, color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{p.replace('### ', '')}</Text>
        </View>
      );
    }
    if (p.startsWith('- ')) {
      return <Text key={i} style={{ ...styles.text, marginBottom: 4, paddingLeft: 8 }}>{'•  '}{p.slice(2)}</Text>;
    }
    const parts = p.split(/(\*\*.*?\*\*)/g);
    return (
      <Text key={i} style={{ ...styles.text, marginBottom: 6 }}>
        {parts.map((s, j) => s.startsWith('**') && s.endsWith('**') ? <Text key={j} style={styles.bold}>{s.slice(2, -2)}</Text> : <Text key={j}>{s}</Text>)}
      </Text>
    );
  });
};

interface PremiumPDFDocumentProps {
  profile: UserProfile;
  klineData?: DestinyScorePoint[];
  transitDetails?: Record<number, TransitEvent[]>;
  insightData?: any;
  logoSrc?: string;
}

export const PremiumPDFDocument = ({ profile, klineData, transitDetails, insightData, logoSrc = '/logo.png' }: PremiumPDFDocumentProps) => {
  const birthYear = parseInt(profile.birthDate?.split('-')[0] || '1990', 10);
  const lifeTurnings = (klineData || []).filter(d => (d.isPeak || d.isCrossroads) && d.year >= birthYear);
  const turningsByDecade: Record<string, DestinyScorePoint[]> = {};
  lifeTurnings.forEach(t => {
    const decade = Math.floor(t.year / 10) * 10;
    if (!turningsByDecade[decade]) turningsByDecade[decade] = [];
    turningsByDecade[decade].push(t);
  });
  const currentYear = new Date().getFullYear();

  const Footer = () => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>ASTROCURVE LIFE CODEX</Text>
      <Text style={styles.footerText}>CONFIDENTIAL · {profile?.name?.toUpperCase()}</Text>
    </View>
  );

  const Header = ({ title, sub }: { title: string; sub: string }) => (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{sub}</Text>
      </View>
      {logoSrc && <Image src={logoSrc} style={styles.headerLogo} />}
    </View>
  );

  const InsightSection = ({ badge, label, content, accent }: { badge: string; label?: string; content?: string; accent?: string }) => {
    if (!content) return null;
    const borderColor = accent || '#555';
    return (
      <View style={{ ...styles.section, borderLeftColor: borderColor }}>
        <View style={{ ...styles.badge, borderLeftColor: accent || '#D4AF37' }}>
          <Text style={{ ...styles.badgeText, color: accent || '#D4AF37' }}>{badge}</Text>
        </View>
        {label && <Text style={{ fontSize: 10, color: '#fff', fontWeight: 'bold', marginBottom: 6 }}>{label}</Text>}
        {renderRich(content)}
      </View>
    );
  };

  return (
    <Document>
      {/* ══════ COVER PAGE ══════ */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {logoSrc && <Image src={logoSrc} style={{ width: 60, height: 60, marginBottom: 25 }} />}
          <Text style={{ fontSize: 9, color: '#D4AF37', letterSpacing: 6, marginBottom: 20 }}>ASTROCURVE</Text>
          <Text style={{ fontSize: 24, color: '#ffffff', marginBottom: 6, textAlign: 'center', letterSpacing: 2 }}>YOUR COMPLETE</Text>
          <Text style={{ fontSize: 24, color: '#ffffff', marginBottom: 16, textAlign: 'center', letterSpacing: 2 }}>LIFE CODEX</Text>
          <Text style={{ fontSize: 10, color: '#D4AF37', marginBottom: 35, textAlign: 'center', letterSpacing: 4, textTransform: 'uppercase' }}>Birth Chart Analysis · Timing · Strategy</Text>
          <View style={{ width: 50, height: 1, backgroundColor: '#D4AF37', marginBottom: 35 }} />
          <Text style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Prepared Exclusively For</Text>
          <Text style={{ fontSize: 20, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase' }}>{insightData?.nickname || profile?.name || 'You'}</Text>
          <View style={{ backgroundColor: '#110F18', padding: 16, marginTop: 30, borderRadius: 4, width: '80%', borderTop: '2px solid #333' }}>
            <Text style={{ fontSize: 10, color: '#aaa', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6 }}>
              &quot;{insightData?.coreQuote || 'Your core trajectory mapped across time and space.'}&quot;
            </Text>
          </View>
          <View style={{ marginTop: 30, width: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 8, color: '#555' }}>Sun: {profile.sun?.sign} {profile.sun?.degree}°</Text>
              <Text style={{ fontSize: 8, color: '#555' }}>Moon: {profile.moon?.sign} {profile.moon?.degree}°</Text>
              <Text style={{ fontSize: 8, color: '#555' }}>Rising: {profile.rising?.sign} {profile.rising?.degree}°</Text>
            </View>
            <Text style={{ fontSize: 8, color: '#444', textAlign: 'center' }}>Born {profile.birthDate} · {profile.birthLocation}</Text>
          </View>
          <Text style={{ fontSize: 8, color: '#444', marginTop: 30, textAlign: 'center', maxWidth: 320, lineHeight: 1.4 }}>
            Swiss Ephemeris DE431 · Vedic & Western Integration · {(profile?.planets || []).length} Planetary Bodies Analyzed
          </Text>
        </View>
        <Text style={{ position: 'absolute', bottom: 25, color: '#333', fontSize: 7, letterSpacing: 1 }}>CONFIDENTIAL DOCUMENT · DO NOT DISTRIBUTE</Text>
      </Page>

      {/* ══════ TABLE OF CONTENTS ══════ */}
      <Page size="A4" style={styles.page}>
        <Header title="Table of Contents" sub="Your Life Codex Navigation" />
        {[
          ['I', 'Core Personality & Identity'],
          ['II', 'Love, Marriage & Intimacy'],
          ['III', 'Career, Authority & Public Image'],
          ['IV', 'Wealth & Material Life'],
          ['V', 'Health, Energy & Wellness'],
          ['VI', 'Life Chapters & Planetary Periods'],
          ['VII', 'Karmic Lessons & Soul Purpose'],
          ['VIII', 'Family, Children & Legacy'],
          ['IX', 'Spirituality & Inner Practice'],
          ['X', 'Education, Intellect & Communication'],
          ['XI', 'Travel, Home & Lifestyle'],
          ['XII', 'Hidden Strengths & Caution Zones'],
          ['XIII', 'Birth Chart Data — Ephemeris'],
          ['XIV', 'Life Curve — 100-Year Trajectory'],
          ['XV', '5-Year Strategic Forecast'],
        ].map(([num, title], i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottom: '1px solid #1A1820' }}>
            <Text style={{ fontSize: 9, color: '#D4AF37', width: 30 }}>{num}.</Text>
            <Text style={{ fontSize: 9, color: '#ccc', flex: 1 }}>{title}</Text>
            <Text style={{ fontSize: 8, color: '#555' }}>{'·'.repeat(40)}</Text>
          </View>
        ))}
        <Footer />
      </Page>

      {/* ══════ I. CORE PERSONALITY ══════ */}
      {insightData?.summary && (
        <Page size="A4" style={styles.page}>
          <Header title="I. Core Personality & Identity" sub="Who You Are Beneath the Surface" />
          <Text style={{ ...styles.text, marginBottom: 10, fontStyle: 'italic', color: '#999' }}>
            This chapter maps your psychological architecture — the mask you show the world, the attachment patterns running beneath awareness, and the person you are becoming.
          </Text>
          <InsightSection badge="PERSONALITY BLUEPRINT" content={insightData.summary} />
          <Footer />
        </Page>
      )}

      {/* ══════ II. LOVE & MARRIAGE ══════ */}
      {(insightData?.relationships || insightData?.marriage) && (
        <Page size="A4" style={styles.page}>
          <Header title="II. Love, Marriage & Intimacy" sub="The Heart's Blueprint — Past, Present & Future" />
          <Text style={{ ...styles.text, marginBottom: 10, fontStyle: 'italic', color: '#999' }}>
            Your Venus, Mars, Moon, and 7th House reveal how you love, what you need to feel secure, and when significant relationship shifts arrive.
          </Text>
          <InsightSection badge="LOVE & CONNECTION" label="Attachment Style, Chemistry & Timing" content={insightData.relationships} accent="#E879A0" />
          {insightData.marriage && <InsightSection badge="MARRIAGE & PARTNERSHIP DESTINY" label="7th House · Descendant Analysis" content={insightData.marriage} accent="#E879A0" />}
          <Footer />
        </Page>
      )}

      {/* ══════ III. CAREER & AUTHORITY ══════ */}
      {(insightData?.career || insightData?.authority) && (
        <Page size="A4" style={styles.page}>
          <Header title="III. Career, Authority & Public Image" sub="10th House · Midheaven · Leadership Style" />
          <InsightSection badge="CAREER & DIRECTION" label="What Role You Were Built For" content={insightData.career} accent="#F59E0B" />
          {insightData.authority && <InsightSection badge="POWER & LEADERSHIP" label="How the World Sees You" content={insightData.authority} accent="#F59E0B" />}
          <Footer />
        </Page>
      )}

      {/* ══════ IV. WEALTH ══════ */}
      {insightData?.wealth && (
        <Page size="A4" style={styles.page}>
          <Header title="IV. Wealth & Material Life" sub="2nd & 8th House · Financial Rhythm" />
          <Text style={{ ...styles.text, marginBottom: 10, fontStyle: 'italic', color: '#999' }}>
            Your financial temperament is written in the stars. This chapter reveals your accumulation windows, spending patterns, and the timing that separates wealth-building from wealth-losing periods.
          </Text>
          <InsightSection badge="FINANCIAL ARCHITECTURE" content={insightData.wealth} accent="#10B981" />
          {insightData.lifestyle && <InsightSection badge="MATERIAL COMFORT & PROPERTY" label="Where Luxury Meets Timing" content={insightData.lifestyle} accent="#10B981" />}
          <Footer />
        </Page>
      )}

      {/* ══════ V. HEALTH ══════ */}
      {insightData?.health && (
        <Page size="A4" style={styles.page}>
          <Header title="V. Health, Energy & Wellness" sub="Elemental Balance · Somatic Patterns" />
          <InsightSection badge="ENERGY & WELLBEING" label="How Stress Shows Up in Your Body" content={insightData.health} accent="#38BDF8" />
          {insightData.hiddenDangers && <InsightSection badge="CAUTION ZONES" label="Vulnerabilities & Years to Watch" content={insightData.hiddenDangers} accent="#EF4444" />}
          <Footer />
        </Page>
      )}

      {/* ══════ VI. LIFE CHAPTERS ══════ */}
      {insightData?.dashaTimeline && (
        <Page size="A4" style={styles.page}>
          <Header title="VI. Life Chapters & Planetary Periods" sub="Mahadasha · Antardasha · Chapter Transitions" />
          <Text style={{ ...styles.text, marginBottom: 10, fontStyle: 'italic', color: '#999' }}>
            Your life moves in distinct chapters governed by planetary rulers. Each Dasha period colors your relationships, career, health, and spiritual growth differently.
          </Text>
          <InsightSection badge="PLANETARY PERIODS (DASHA)" content={insightData.dashaTimeline} accent="#A78BFA" />
          <Footer />
        </Page>
      )}

      {/* ══════ VII. KARMIC LESSONS ══════ */}
      {insightData?.karma && (
        <Page size="A4" style={styles.page}>
          <Header title="VII. Karmic Lessons & Soul Purpose" sub="North Node · South Node · 12th House" />
          <Text style={{ ...styles.text, marginBottom: 10, fontStyle: 'italic', color: '#999' }}>
            Your Rahu-Ketu axis reveals the evolutionary direction of your soul — what you mastered in past lives and what you are here to learn now.
          </Text>
          <InsightSection badge="KARMIC BLUEPRINT" label="Past-Life Patterns & Soul Growth" content={insightData.karma} accent="#C084FC" />
          <Footer />
        </Page>
      )}

      {/* ══════ VIII. FAMILY & CHILDREN ══════ */}
      {(insightData?.family || insightData?.children) && (
        <Page size="A4" style={styles.page}>
          <Header title="VIII. Family, Children & Legacy" sub="4th House · 5th House · Ancestral Patterns" />
          {insightData.family && <InsightSection badge="FAMILY & ANCESTRY" label="Inherited Patterns from Parents" content={insightData.family} />}
          {insightData.children && <InsightSection badge="CHILDREN & CREATIVE LEGACY" label="5th House · Fertility & Nurturing" content={insightData.children} />}
          <Footer />
        </Page>
      )}

      {/* ══════ IX. SPIRITUALITY ══════ */}
      {insightData?.spirituality && (
        <Page size="A4" style={styles.page}>
          <Header title="IX. Spiritual Path & Inner Practice" sub="12th House · Neptune · Ketu" />
          <InsightSection badge="SPIRITUAL ALIGNMENT" label="Your Connection to the Numinous" content={insightData.spirituality} accent="#818CF8" />
          <Footer />
        </Page>
      )}

      {/* ══════ X. EDUCATION ══════ */}
      {insightData?.education && (
        <Page size="A4" style={styles.page}>
          <Header title="X. Education, Intellect & Communication" sub="Mercury · 3rd/9th House Axis" />
          <InsightSection badge="INTELLECT & LEARNING STYLE" content={insightData.education} accent="#2DD4BF" />
          <Footer />
        </Page>
      )}

      {/* ══════ XI. TRAVEL & LIFESTYLE ══════ */}
      {insightData?.lifestyle && (
        <Page size="A4" style={styles.page}>
          <Header title="XI. Travel, Home & Lifestyle" sub="4th & 9th House · Property & Movement" />
          <InsightSection badge="LIFESTYLE & TRAVEL" content={insightData.lifestyle} />
          <Footer />
        </Page>
      )}

      {/* ══════ XII. STRENGTHS & SHADOWS ══════ */}
      {(insightData?.strengths || insightData?.warnings) && (
        <Page size="A4" style={styles.page}>
          <Header title="XII. Hidden Strengths & Shadow Patterns" sub="Your Superpowers & The Traps to Avoid" />
          {insightData.strengths && <InsightSection badge="NATURAL STRENGTHS" label="The 3 Gifts Your Chart Carries" content={insightData.strengths} accent="#10B981" />}
          {insightData.warnings && <InsightSection badge="SHADOW PATTERNS" label="Self-Sabotage Loops to Break" content={insightData.warnings} accent="#EF4444" />}
          <Footer />
        </Page>
      )}

      {/* ══════ XIII. EPHEMERIS TABLE ══════ */}
      <Page size="A4" style={styles.page}>
        <Header title="XIII. Birth Chart Data" sub="Swiss Ephemeris DE431 · Exact Planetary Positions" />
        <Text style={{ ...styles.text, marginBottom: 10 }}>
          The mathematical foundation of your entire reading. Every insight in this codex is derived from these precise celestial coordinates at your moment of birth.
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColH}><Text style={styles.cellH}>Planet</Text></View>
            <View style={styles.tableColH}><Text style={styles.cellH}>Sign</Text></View>
            <View style={styles.tableColH}><Text style={styles.cellH}>Degree</Text></View>
            <View style={styles.tableColH}><Text style={styles.cellH}>House</Text></View>
          </View>
          {(profile?.planets || []).map((planet, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableCol}><Text style={{ ...styles.cell, color: '#fff' }}>{planet.symbol} {planet.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.cell}>{planet.sign}</Text></View>
              <View style={styles.tableCol}><Text style={styles.cell}>{planet.degree}° {planet.minute}&apos;</Text></View>
              <View style={styles.tableCol}><Text style={styles.cell}>{planet.house}</Text></View>
            </View>
          ))}
        </View>

        {/* Element & Modality Summary */}
        <View style={{ marginTop: 16, flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, padding: 10, backgroundColor: '#110F18', borderRadius: 4 }}>
            <Text style={{ fontSize: 8, color: '#D4AF37', fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Elements</Text>
            <Text style={{ fontSize: 8, color: '#ccc' }}>Fire: {profile.elements?.fire}%  ·  Earth: {profile.elements?.earth}%</Text>
            <Text style={{ fontSize: 8, color: '#ccc' }}>Air: {profile.elements?.air}%  ·  Water: {profile.elements?.water}%</Text>
          </View>
          {profile.modalities && (
            <View style={{ flex: 1, padding: 10, backgroundColor: '#110F18', borderRadius: 4 }}>
              <Text style={{ fontSize: 8, color: '#D4AF37', fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Modalities</Text>
              <Text style={{ fontSize: 8, color: '#ccc' }}>Cardinal: {profile.modalities.cardinal}%  ·  Fixed: {profile.modalities.fixed}%</Text>
              <Text style={{ fontSize: 8, color: '#ccc' }}>Mutable: {profile.modalities.mutable}%</Text>
            </View>
          )}
        </View>

        <Footer />
      </Page>

      {/* ══════ XIV. LIFE CURVE 100-YEAR ══════ */}
      {Object.keys(turningsByDecade).length > 0 && (
        <Page size="A4" style={styles.page}>
          <Header title="XIV. Life Curve — 100-Year Trajectory" sub="Peak Years & Crossroads Mapped" />
          <Text style={{ ...styles.text, marginBottom: 12 }}>
            Your macro life curve filtered for the highest-leverage Peak Years and structural Crossroads. These are the moments where small decisions create outsized outcomes.
          </Text>
          {Object.entries(turningsByDecade).slice(0, 5).map(([decade, events], idx) => (
            <View key={idx} style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, color: '#fff', borderBottom: '1px solid #333', paddingBottom: 4, marginBottom: 8, letterSpacing: 2 }}>{decade}s</Text>
              {events.map((evt, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 8, paddingBottom: 8, borderBottom: i !== events.length - 1 ? '1px dashed #222' : 'none' }}>
                  <Text style={{ width: '12%', fontSize: 10, color: '#D4AF37', fontWeight: 'bold' }}>{evt.year}</Text>
                  <Text style={{ width: '22%', fontSize: 8, color: evt.isPeak ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>{evt.isPeak ? '★ PEAK' : '▲ CROSSROADS'}</Text>
                  <Text style={{ width: '12%', fontSize: 8, color: '#888' }}>{evt.score}/100</Text>
                  <Text style={{ width: '54%', fontSize: 8, color: '#aaa', lineHeight: 1.4 }}>{evt.explanation}</Text>
                </View>
              ))}
            </View>
          ))}
          <Footer />
        </Page>
      )}

      {/* ══════ XV. 5-YEAR STRATEGIC FORECAST ══════ */}
      {transitDetails && (() => {
        const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
        return years.map(year => {
          const transits = transitDetails[year] || [];
          if (transits.length === 0) return null;
          const top = [...transits].sort((a, b) => Math.abs(b.impactScore) - Math.abs(a.impactScore)).slice(0, 3);
          return (
            <Page key={`t-${year}`} size="A4" style={styles.page}>
              <Header title={`XV. ${year} Forecast`} sub="Top 3 Planetary Transits" />
              <Text style={{ ...styles.text, marginBottom: 12, color: '#aaa', borderBottom: '1px solid #333', paddingBottom: 8 }}>
                The dominant cosmic vectors shaping your {year}. These structural shifts demand preparation.
              </Text>
              {top.map((tr, idx) => (
                <View key={idx} style={{ ...styles.section, borderLeft: tr.impactScore < 0 ? '3px solid #EF4444' : '3px solid #10B981' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{tr.theme}</Text>
                    <Text style={{ fontSize: 9, color: tr.impactScore > 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>{tr.impactScore > 0 ? '+' : ''}{tr.impactScore}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#D4AF37', marginBottom: 4, letterSpacing: 1 }}>{tr.title}</Text>
                  <Text style={{ fontSize: 8, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{tr.planet} {tr.aspect} · {tr.phase || 'Exact'}</Text>
                  <Text style={{ ...styles.text, fontSize: 9 }}>{tr.description}</Text>
                  <View style={styles.proto}>
                    <Text style={{ fontSize: 8, color: '#D4AF37', fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Action Directive</Text>
                    <Text style={{ fontSize: 8, color: '#bbb', lineHeight: 1.5 }}>{tr.advice || 'Prepare for this structural shift with conscious intention.'}</Text>
                  </View>
                </View>
              ))}
              <Footer />
            </Page>
          );
        });
      })()}

      {/* ══════ BACK COVER ══════ */}
      <Page size="A4" style={{ ...styles.coverPage, backgroundColor: '#07060A', justifyContent: 'center' }}>
        {logoSrc && <Image src={logoSrc} style={{ width: 36, height: 36, marginBottom: 16, opacity: 0.5 }} />}
        <Text style={{ fontSize: 12, color: '#D4AF37', letterSpacing: 6, marginBottom: 25 }}>ASTROCURVE</Text>
        <View style={{ width: 40, height: 1, backgroundColor: '#D4AF37', opacity: 0.3, marginBottom: 25 }} />
        <Text style={{ fontSize: 10, color: '#888', textAlign: 'center', lineHeight: 2, maxWidth: 380 }}>
          You have reached the end of your Life Codex.{'\n\n'}
          Astrology does not replace your free will — it maps the structural possibilities of the terrain. The insights in this document are designed to help you make wiser decisions at the right moments.{'\n\n'}
          Your chart is not your cage. It is your compass.
        </Text>
        <Text style={{ fontSize: 8, color: '#444', marginTop: 60, letterSpacing: 2, textTransform: 'uppercase' }}>End of Document</Text>
        <Text style={{ fontSize: 7, color: '#333', marginTop: 15 }}>astrocurve.net · {currentYear}</Text>
      </Page>
    </Document>
  );
};

export default PremiumPDFDocument;
