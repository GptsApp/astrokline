import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { UserProfile, DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';

// --- Polished High-End Styles ---
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#0A0A0F', color: '#ffffff', fontFamily: 'Helvetica' },
  coverPage: { padding: 40, backgroundColor: '#050508', color: '#ffffff', fontFamily: 'Helvetica', justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 30, borderBottom: '1px solid #333', paddingBottom: 20 },
  title: { fontSize: 26, color: '#D4AF37', marginBottom: 8, letterSpacing: 1 },
  subtitle: { fontSize: 11, color: '#888888', textTransform: 'uppercase', letterSpacing: 2 },
  section: { marginTop: 20, marginBottom: 20, padding: 20, backgroundColor: '#110F18', borderRadius: 8, borderLeft: '3px solid #D4AF37' },
  sectionTitle: { fontSize: 16, color: '#D4AF37', marginBottom: 15, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  text: { fontSize: 11, lineHeight: 1.8, color: '#cccccc' },
  strongText: { color: '#ffffff', fontWeight: 'bold', backgroundColor: '#222' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#333', borderRightWidth: 0, borderBottomWidth: 0, marginTop: 15 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#333', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#1A1820', padding: 5 },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#333', borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  tableCellHeader: { margin: 'auto', fontSize: 10, fontWeight: 'bold', color: '#D4AF37' },
  tableCell: { margin: 'auto', fontSize: 10, color: '#bbb' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#444', fontSize: 9, borderTop: '1px solid #222', paddingTop: 10 },
  protocolBox: { marginTop: 15, padding: 15, backgroundColor: '#050508', borderRadius: 4, borderLeft: '3px solid #10B981' },
});

// A utility to render Markdown-like string into React-PDF components
const renderRichText = (text: string) => {
  if (!text) return null;
  // Replace typical markdown bullet point logic
  const normalizedText = text.replace(/\\n/g, '\n');
  return normalizedText.split('\n').map((paragraph, i) => {
    if (!paragraph.trim()) return null;
    
    // Header check
    if (paragraph.startsWith('### ')) {
      return (
        <View key={i} style={{ marginTop: 15, marginBottom: 10, padding: 10, backgroundColor: '#1A1820', borderLeft: '3px solid #EF4444' }}>
          <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
            {paragraph.replace('### ', '')}
          </Text>
        </View>
      );
    }
    
    // Bold check
    const parts = paragraph.split(/(\*\*.*?\*\*)/g);
    return (
      <Text key={i} style={{ ...styles.text, marginBottom: 12 }}>
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
}

// ─── PREMIUM PDF DOCUMENT STRUCTURE ───
export const PremiumPDFDocument = ({ profile, klineData, transitDetails, insightData }: PremiumPDFDocumentProps) => {
  const lifeTurnings = (klineData || []).filter(d => (d.isPeak || d.isCrossroads) && d.year >= parseInt(profile.birthDate.split('-')[0], 10));
  const turningsByDecade: Record<string, DestinyScorePoint[]> = {};
  lifeTurnings.forEach(t => {
    const decade = Math.floor(t.year / 10) * 10;
    if (!turningsByDecade[decade]) turningsByDecade[decade] = [];
    turningsByDecade[decade].push(t);
  });

  return (
    <Document>
      {/* --- COVER PAGE --- */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#D4AF37', letterSpacing: 6, marginBottom: 25 }}>ASTROKLINE ENGINE</Text>
          <Text style={{ fontSize: 32, color: '#ffffff', marginBottom: 8, textAlign: 'center', letterSpacing: 2 }}>THE COMPLETE</Text>
          <Text style={{ fontSize: 32, color: '#ffffff', marginBottom: 20, textAlign: 'center', letterSpacing: 2 }}>DESTINY TIMELINE</Text>
          <Text style={{ fontSize: 14, color: '#EF4444', marginBottom: 40, textAlign: 'center', letterSpacing: 8, textTransform: 'uppercase' }}>& Master Action Plan</Text>
          <View style={{ width: 40, height: 1, backgroundColor: '#D4AF37', marginBottom: 40 }} />
          <Text style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 }}>Prepared Exclusively For</Text>
          <Text style={{ fontSize: 24, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase' }}>{insightData?.nickname || profile?.name || 'You'}</Text>
          <Text style={{ fontSize: 12, color: '#aaa', marginTop: 25, textAlign: 'center', maxWidth: 400, fontStyle: 'italic', lineHeight: 1.5 }}>
            "{insightData?.coreQuote || 'Your core trajectory mapped across time and space.'}"
          </Text>
          <Text style={{ fontSize: 10, color: '#555', marginTop: 60, textAlign: 'center', maxWidth: 350, lineHeight: 1.5 }}>
            Generated with extreme precision via Swiss Ephemeris DE431. 
            Includes 100-year structural trajectory, psychological shadow reading, deep tactical blueprints, and chronological major transits.
          </Text>
        </View>
        <Text style={styles.footer}>Strictly Confidential. An authoritative guide to ego actualization and strategic timing.</Text>
      </Page>

      {/* --- MODULE I: THE PSYCHOLOGICAL DIAGNOSIS --- */}
      {insightData && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Module I. The Archetypal Diagnosis</Text>
            <Text style={styles.subtitle}>Authority over your internal operating system</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Somatic Blueprint</Text>
            {renderRichText(insightData.summary)}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Superpowers & Fatal Blindspots</Text>
            <Text style={{ fontSize: 12, color: '#D4AF37', fontWeight: 'bold', marginBottom: 10 }}>Your Tactical Advantages (Strengths)</Text>
            {renderRichText(insightData.strengths)}
            <View style={{ width: '100%', height: 1, backgroundColor: '#333', marginVertical: 15 }} />
            <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 'bold', marginBottom: 10 }}>The Shadow Trap (Warnings)</Text>
            {renderRichText(insightData.warnings)}
          </View>
          <Text style={styles.footer}>AstroKline Masters Class / Psychological Diagnosis</Text>
        </Page>
      )}

      {/* --- MODULE II: STRATEGIC ACTION PLANS --- */}
      {insightData && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Module II. The Master Blueprints</Text>
            <Text style={styles.subtitle}>Material Domination & Relational Physics</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authority & Career Protocol</Text>
            {renderRichText(insightData.career)}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wealth Structuring & Capital Allocation</Text>
            {renderRichText(insightData.wealth)}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Relational Karmic Physics</Text>
            {renderRichText(insightData.relationships)}
          </View>
          <Text style={styles.footer}>AstroKline Masters Class / Step-by-Step Strategic Protocols</Text>
        </Page>
      )}

      {/* --- MODULE III: EPHEMERIS LOG --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Module III. Raw Ephemeris Logic</Text>
          <Text style={styles.subtitle}>The Mathematical Coordinates Validating the Above</Text>
        </View>
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
        <Text style={styles.footer}>AstroKline Masters Class / Mathematical Validation</Text>
      </Page>

      {/* --- MODULE IV: THE 100-YEAR LIFE CURVE --- */}
      {Object.keys(turningsByDecade).length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Module IV. Life's Karmic Wave</Text>
            <Text style={styles.subtitle}>100-Year Macro-Trajectory Preview</Text>
          </View>
          <Text style={{...styles.text, marginBottom: 15 }}>
            To master the micro-cycles, you must understand your macro-reality. Below is your 100-year trajectory overview, filtering exclusively for the ultimate high-leverage Peak Years and structural Crossroads.
          </Text>
          {Object.entries(turningsByDecade).splice(0, 4).map(([decade, events], idx) => (
            <View key={idx} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: '#fff', borderBottom: '1px solid #333', paddingBottom: 5, marginBottom: 10, letterSpacing: 2 }}>{decade}s Timeline</Text>
              {events.map((evt, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 12, paddingBottom: 12, borderBottom: i !== events.length-1 ? '1px dashed #222' : 'none' }}>
                  <Text style={{ width: '15%', fontSize: 13, color: '#D4AF37', fontWeight: 'bold' }}>{evt.year}</Text>
                  <Text style={{ width: '25%', fontSize: 11, color: evt.isPeak ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>{evt.isPeak ? '★ EPIC PEAK' : '▲ CROSSROADS'}</Text>
                  <Text style={{ width: '60%', fontSize: 11, color: '#aaa', lineHeight: 1.5 }}>
                     Energy: {evt.score}/100. {evt.explanation}
                  </Text>
                </View>
              ))}
            </View>
          ))}
          <Text style={styles.footer}>AstroKline Masters Class / Global Context</Text>
        </Page>
      )}

      {/* --- MODULE V: CHRONOLOGICAL TRANSITS --- */}
      {transitDetails && Object.entries(transitDetails).filter(([_, transits]) => transits.length > 0).map(([year, transits]) => (
        <Page key={`t-${year}`} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Module V. {year} Almanac</Text>
            <Text style={styles.subtitle}>Micro-Transits & Exact Daily Directives</Text>
          </View>

          {transits.map((transit, idx) => (
            <View key={idx} style={{...styles.section, borderLeft: transit.impactScore < 0 ? '3px solid #EF4444' : '3px solid #10B981' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: 13, color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' }}>{transit.theme} Sector</Text>
                <Text style={{ fontSize: 13, color: transit.impactScore > 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                  Force Vector: {transit.impactScore > 0 ? '+' : ''}{transit.impactScore}
                </Text>
              </View>
              
              <Text style={{ fontSize: 15, color: '#D4AF37', marginBottom: 8, letterSpacing: 1 }}>{transit.title}</Text>
              
              <Text style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>
                [Exact Geometry: {transit.planet} {transit.aspect} | Phase: {transit.phase || 'Exact'}]
              </Text>
              
              <Text style={{ ...styles.text, marginTop: 5, fontSize: 11 }}>{transit.description}</Text>

              <View style={styles.protocolBox}>
                <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Authority Directive / Action Plan
                </Text>
                <Text style={{ fontSize: 10, color: '#bbb', lineHeight: 1.6 }}>
                  {transit.advice || "Execute structural overhaul based on the above angular velocity."}
                </Text>
              </View>
            </View>
          ))}
          <Text style={styles.footer}>AstroKline Masters Class / {year} Tactical Real-Time Maps</Text>
        </Page>
      ))}

      {/* --- BACK COVER --- */}
      <Page size="A4" style={{...styles.coverPage, backgroundColor: '#07060A', justifyContent: 'center'}}>
        <Text style={{ fontSize: 16, color: '#D4AF37', letterSpacing: 8, marginBottom: 30 }}>ASTROKLINE</Text>
        <Text style={{ fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 2, maxWidth: 400 }}>
          You have reached the end of the codex.{'\n\n'}
          Astrology does not replace your free will; it maps the structural limits and infinite possibilities of the terrain. The protocols established in this Master Action Plan are designed to be executed ruthlessly.{'\n\n'}
          Now, build your empire.
        </Text>
        <Text style={{ fontSize: 10, color: '#444', marginTop: 100, letterSpacing: 2 }}>DOCUMENT END</Text>
      </Page>

    </Document>
  );
};

export default PremiumPDFDocument;
