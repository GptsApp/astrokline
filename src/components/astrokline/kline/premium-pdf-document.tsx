import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { UserProfile, DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';

// --- Polished Gallup-Grade Styles ---
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#0A0A0F', color: '#ffffff', fontFamily: 'Helvetica' },
  coverPage: { padding: 40, backgroundColor: '#050508', color: '#ffffff', fontFamily: 'Helvetica', justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 30, borderBottom: '1px solid #333', paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTextContainer: { flex: 1 },
  headerLogo: { width: 30, height: 30 },
  title: { fontSize: 24, color: '#D4AF37', marginBottom: 6, letterSpacing: 1 },
  subtitle: { fontSize: 10, color: '#888888', textTransform: 'uppercase', letterSpacing: 2 },
  section: { marginTop: 15, marginBottom: 15, padding: 20, backgroundColor: '#110F18', borderRadius: 4, borderLeft: '2px solid #555' },
  sectionTitle: { fontSize: 14, color: '#D4AF37', marginBottom: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  gallupBadge: { backgroundColor: '#1A1820', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 2, marginBottom: 10, alignSelf: 'flex-start', borderLeft: '3px solid #D4AF37' },
  gallupBadgeText: { fontSize: 10, color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  text: { fontSize: 11, lineHeight: 1.8, color: '#cccccc' },
  strongText: { color: '#ffffff', fontWeight: 'bold' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#333', borderRightWidth: 0, borderBottomWidth: 0, marginTop: 15 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#333', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#1A1820', padding: 6 },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#333', borderLeftWidth: 0, borderTopWidth: 0, padding: 6 },
  tableCellHeader: { margin: 'auto', fontSize: 10, fontWeight: 'bold', color: '#D4AF37' },
  tableCell: { margin: 'auto', fontSize: 10, color: '#bbb' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: 10 },
  footerText: { color: '#444', fontSize: 8, textTransform: 'uppercase', letterSpacing: 1 },
  protocolBox: { marginTop: 15, padding: 15, backgroundColor: '#050508', borderRadius: 2, borderTop: '1px solid #333' },
});

// A utility to render Markdown-like string into structured React-PDF components
const renderRichText = (text: string) => {
  if (!text) return null;
  const normalizedText = text.replace(/\\n/g, '\n');
  return normalizedText.split('\n').map((paragraph, i) => {
    if (!paragraph.trim()) return null;
    
    // Header check
    if (paragraph.startsWith('### ')) {
      return (
        <View key={i} style={{ marginTop: 15, marginBottom: 10, padding: 8, backgroundColor: '#1A1820', borderLeft: '3px solid #EF4444' }}>
          <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
            {paragraph.replace('### ', '')}
          </Text>
        </View>
      );
    }
    
    // Bold check
    const parts = paragraph.split(/(\*\*.*?\*\*)/g);
    return (
      <Text key={i} style={{ ...styles.text, marginBottom: 10 }}>
        {parts.map((p, j) => {
          if (p.startsWith('**') && p.endsWith('**')) {
            return <Text key={j} style={styles.strongText}> {p.slice(2, -2)} </Text>;
          }
          return <Text key={j}>{p}</Text>;
        })}
      </Text>
    );
  });
};

interface PremiumPDFDocumentProps {
  profile: UserProfile;
  klineData?: DestinyScorePoint[];
  transitDetails?: Record<number, TransitEvent[]>;
  insightData?: any; // The incredibly deep psychological insight API response
  logoSrc?: string; // Path to Astrokline logo
}

// ─── PREMIUM PDF DOCUMENT STRUCTURE ───
export const PremiumPDFDocument = ({ profile, klineData, transitDetails, insightData, logoSrc = '/logo.png' }: PremiumPDFDocumentProps) => {
  const lifeTurnings = (klineData || []).filter(d => (d.isPeak || d.isCrossroads) && d.year >= parseInt(profile.birthDate.split('-')[0], 10));
  const turningsByDecade: Record<string, DestinyScorePoint[]> = {};
  lifeTurnings.forEach(t => {
    const decade = Math.floor(t.year / 10) * 10;
    if (!turningsByDecade[decade]) turningsByDecade[decade] = [];
    turningsByDecade[decade].push(t);
  });

  const FooterInfo = () => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>ASTROKLINE PSYCHOLOGICAL METRICS</Text>
      <Text style={styles.footerText}>CONFIDENTIAL REPORT FOR: {profile?.name}</Text>
    </View>
  );

  const HeaderInfo = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {logoSrc && <Image src={logoSrc} style={styles.headerLogo} />}
    </View>
  );

  return (
    <Document>
      {/* --- COVER PAGE --- */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {logoSrc && <Image src={logoSrc} style={{ width: 80, height: 80, marginBottom: 30 }} />}
          <Text style={{ fontSize: 10, color: '#D4AF37', letterSpacing: 6, marginBottom: 25 }}>ASTROKLINE PSYCHOMETRICS</Text>
          <Text style={{ fontSize: 28, color: '#ffffff', marginBottom: 8, textAlign: 'center', letterSpacing: 2 }}>CLIFTON-GRADE</Text>
          <Text style={{ fontSize: 28, color: '#ffffff', marginBottom: 20, textAlign: 'center', letterSpacing: 2 }}>PSYCHOLOGICAL REPORT</Text>
          <Text style={{ fontSize: 12, color: '#EF4444', marginBottom: 40, textAlign: 'center', letterSpacing: 6, textTransform: 'uppercase' }}>& Strategic Master Plan</Text>
          
          <View style={{ width: 60, height: 1, backgroundColor: '#D4AF37', marginBottom: 40 }} />
          
          <Text style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 15 }}>Prepared Exclusively For</Text>
          <Text style={{ fontSize: 22, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase' }}>{insightData?.nickname || profile?.name || 'You'}</Text>
          
          <View style={{ backgroundColor: '#110F18', padding: 20, marginTop: 40, borderRadius: 4, width: '80%', borderTop: '2px solid #333' }}>
            <Text style={{ fontSize: 11, color: '#aaa', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{insightData?.coreQuote || 'Your core trajectory mapped across time and space.'}"
            </Text>
          </View>

          <Text style={{ fontSize: 9, color: '#555', marginTop: 50, textAlign: 'center', maxWidth: 350, lineHeight: 1.5 }}>
            Generated via Astrokline Semantic Engine & Swiss Ephemeris DE431. 
            Contains heavily structured psychological shadow dynamics, multi-decade macro tracking, and absolute chronological directives.
          </Text>
        </View>
        <Text style={{ position: 'absolute', bottom: 30, color: '#333', fontSize: 8, letterSpacing: 1 }}>CONFIDENTIAL INTERNAL DOCUMENT. DO NOT DISTRIBUTE.</Text>
      </Page>

      {/* --- MODULE I: THE GALLUP-STYLE TOP 3 SIGNATURE THEMES --- */}
      {insightData && (
        <Page size="A4" style={styles.page}>
          <HeaderInfo title="I. Signature Psychological Themes" subtitle="Your Top 3 Dominant Archetypal Strengths & Cognitive Blindspots" />
          
          <View style={styles.section}>
            <View style={styles.gallupBadge}><Text style={styles.gallupBadgeText}>1. Primary Weapon Set</Text></View>
            <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>The Execution & Intuition Engine</Text>
            {renderRichText(insightData.strengths)}
          </View>

          <View style={styles.section}>
            <View style={styles.gallupBadge}><Text style={styles.gallupBadgeText}>2. Somatic Overload Warning</Text></View>
            <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>Energetic Exhaustion Indicators</Text>
            {renderRichText(insightData.health)}
          </View>

          <View style={{...styles.section, borderLeftColor: '#EF4444'}}>
            <View style={styles.gallupBadge}><Text style={{...styles.gallupBadgeText, color: '#EF4444'}}>3. Fatal Shadow Trap</Text></View>
            <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 'bold', marginBottom: 8 }}>The Subconscious Self-Sabotage Loop</Text>
            {renderRichText(insightData.warnings)}
          </View>

          <FooterInfo />
        </Page>
      )}

      {/* --- MODULE II: STRATEGIC ACTION PLANS --- */}
      {insightData && (
        <Page size="A4" style={styles.page}>
          <HeaderInfo title="II. Strategic Master Plans" subtitle="Material Domination & Relational Physics" />

          <View style={styles.section}>
            <View style={styles.gallupBadge}><Text style={styles.gallupBadgeText}>DOMAIN 01: AUTHORITY & CAREER</Text></View>
            {renderRichText(insightData.career)}
          </View>

          <View style={styles.section}>
            <View style={styles.gallupBadge}><Text style={styles.gallupBadgeText}>DOMAIN 02: WEALTH STRUCTURING</Text></View>
            {renderRichText(insightData.wealth)}
          </View>

          <View style={styles.section}>
            <View style={styles.gallupBadge}><Text style={styles.gallupBadgeText}>DOMAIN 03: RELATIONAL PHYSICS</Text></View>
            {renderRichText(insightData.relationships)}
          </View>

          <FooterInfo />
        </Page>
      )}

      {/* --- MODULE III: EPHEMERIS LOG --- */}
      <Page size="A4" style={styles.page}>
        <HeaderInfo title="III. Raw Ephemeris Logic" subtitle="Mathematical Validation Array" />
        
        <Text style={{...styles.text, marginBottom: 15}}>
          The authority of this document rests on precise celestial geodetics mapped at your exact birth coordinates. The planetary architecture dictates the timing of your evolutionary stress tests and massive expansion windows.
        </Text>
        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Celestial Engine</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Frequency (Sign)</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Exact Geometry</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Arena (House)</Text></View>
          </View>
          {(profile?.planets || []).map((planet, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableCol}><Text style={{...styles.tableCell, color: '#fff'}}>{planet.symbol} {planet.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{planet.sign}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{planet.degree}° {planet.minute}'</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{planet.house}</Text></View>
            </View>
          ))}
        </View>

        <FooterInfo />
      </Page>

      {/* --- MODULE IV: THE 100-YEAR LIFE CURVE --- */}
      {Object.keys(turningsByDecade).length > 0 && (
        <Page size="A4" style={styles.page}>
          <HeaderInfo title="IV. Life's Karmic Wave" subtitle="100-Year Macro-Trajectory Preview" />
          
          <Text style={{...styles.text, marginBottom: 15 }}>
            To master the micro-cycles, you must understand your macro-reality. Below is your 100-year trajectory overview, filtering exclusively for the ultimate high-leverage Peak Years and structural Crossroads.
          </Text>
          
          {Object.entries(turningsByDecade).splice(0, 4).map(([decade, events], idx) => (
            <View key={idx} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 13, color: '#fff', borderBottom: '1px solid #333', paddingBottom: 5, marginBottom: 10, letterSpacing: 2 }}>{decade}s Timeline</Text>
              {events.map((evt, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 12, paddingBottom: 12, borderBottom: i !== events.length-1 ? '1px dashed #222' : 'none' }}>
                  <Text style={{ width: '15%', fontSize: 12, color: '#D4AF37', fontWeight: 'bold' }}>{evt.year}</Text>
                  <Text style={{ width: '25%', fontSize: 10, color: evt.isPeak ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>{evt.isPeak ? '★ EPIC PEAK' : '▲ CROSSROADS'}</Text>
                  <Text style={{ width: '60%', fontSize: 10, color: '#aaa', lineHeight: 1.5 }}>
                     Energy Index: {evt.score}/100. {evt.explanation}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <FooterInfo />
        </Page>
      )}

      {/* --- MODULE V: THE 5-YEAR STRATEGIC HORIZON --- */}
      {transitDetails && (function() {
        const currentYear = new Date().getFullYear();
        // Exclusively output the next 5 critical years to prevent information overload
        const relevantYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
        
        return relevantYears.map(year => {
          const transits = transitDetails[year] || [];
          if (transits.length === 0) return null;
          
          // Sort by absolute structural impact to find the most intense karmic events
          // Discard the daily noise, keep ONLY the Top 3 epoch-defining vectors
          const topTransits = [...transits]
            .sort((a, b) => Math.abs(b.impactScore) - Math.abs(a.impactScore))
            .slice(0, 3);
            
          return (
            <Page key={`t-${year}`} size="A4" style={styles.page}>
              <HeaderInfo title={`V. ${year} Strategic Almanac`} subtitle="The Top 3 Dominant Cosmic Vectors" />

              <Text style={{...styles.text, marginBottom: 20, fontSize: 10, color: '#aaa', borderBottom: '1px solid #333', paddingBottom: 10}}>
                The following tactical analysis filters out irrelevant daily astrological noise to focus exclusively on the {year} deep-structure karmic events. These are the non-negotiable architectural shifts you must prepare for.
              </Text>

              {topTransits.map((transit, idx) => (
                <View key={idx} style={{...styles.section, borderLeft: transit.impactScore < 0 ? '3px solid #EF4444' : '3px solid #10B981', padding: 15 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{transit.theme} Sector</Text>
                    <Text style={{ fontSize: 11, color: transit.impactScore > 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                      FORCE VECTOR: {transit.impactScore > 0 ? '+' : ''}{transit.impactScore}
                    </Text>
                  </View>
                  
                  <Text style={{ fontSize: 14, color: '#D4AF37', marginBottom: 6, letterSpacing: 1 }}>{transit.title}</Text>
                  
                  <Text style={{ fontSize: 9, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    [Geometry: {transit.planet} {transit.aspect} | Phase: {transit.phase || 'Exact'}]
                  </Text>
                  
                  <Text style={{ ...styles.text, marginTop: 5, fontSize: 11, lineHeight: 1.6 }}>{transit.description}</Text>

                  <View style={{...styles.protocolBox, padding: 12, marginTop: 12}}>
                    <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Authority Directive
                    </Text>
                    <Text style={{ fontSize: 10, color: '#bbb', lineHeight: 1.5 }}>
                      {transit.advice || "Execute structural overhaul based on the above angular velocity."}
                    </Text>
                  </View>
                </View>
              ))}
              
              <FooterInfo />
            </Page>
          );
        });
      })()}

      {/* --- BACK COVER --- */}
      <Page size="A4" style={{...styles.coverPage, backgroundColor: '#07060A', justifyContent: 'center'}}>
        {logoSrc && <Image src={logoSrc} style={{ width: 40, height: 40, marginBottom: 20, opacity: 0.5 }} />}
        <Text style={{ fontSize: 14, color: '#D4AF37', letterSpacing: 6, marginBottom: 30 }}>ASTROKLINE</Text>
        <Text style={{ fontSize: 11, color: '#888', textAlign: 'center', lineHeight: 2, maxWidth: 400 }}>
          You have reached the end of the codex.{'\n\n'}
          Astrology does not replace your free will; it maps the structural limits and infinite possibilities of the terrain. The protocols established in this Master Action Plan are designed to be executed ruthlessly.{'\n\n'}
          Now, build your empire.
        </Text>
        <Text style={{ fontSize: 9, color: '#444', marginTop: 100, letterSpacing: 2 }}>DOCUMENT END</Text>
      </Page>

    </Document>
  );
};

export default PremiumPDFDocument;
