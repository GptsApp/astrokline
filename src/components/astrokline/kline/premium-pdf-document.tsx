import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { UserProfile, DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';

// --- Default Styles ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#0A0A0F', // Dark aesthetic
    color: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '1px solid #333',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#D4AF37', // Gold 
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#15131a',
    borderRadius: 8,
    borderLeft: '4px solid #D4AF37',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#cccccc',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#555',
    fontSize: 9,
    borderTop: '1px solid #222',
    paddingTop: 10,
  }
});

interface PremiumPDFDocumentProps {
  profile: UserProfile;
  klineData?: DestinyScorePoint[];
  transitDetails?: Record<number, TransitEvent[]>;
}

// ─── PREMIUM PDF DOCUMENT STRUCTURE ───
export const PremiumPDFDocument = ({ profile, klineData, transitDetails }: PremiumPDFDocumentProps) => (
  <Document>
    {/* Cover Page */}
    <Page size="A4" style={styles.page}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: '#D4AF37', letterSpacing: 4, marginBottom: 20 }}>ASTROKLINE</Text>
        <Text style={{ fontSize: 36, color: '#ffffff', marginBottom: 10, textAlign: 'center' }}>DEEP PSYCHOLOGICAL</Text>
        <Text style={{ fontSize: 36, color: '#ffffff', marginBottom: 40, textAlign: 'center' }}>TRANSIT MAP</Text>
        <View style={{ width: 50, height: 2, backgroundColor: '#D4AF37', marginBottom: 40 }} />
        <Text style={{ fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Prepared Exclusively For</Text>
        <Text style={{ fontSize: 24, color: '#D4AF37', marginTop: 10 }}>{profile?.name || 'You'}</Text>
      </View>
      <Text style={styles.footer}>Strictly Confidential. For Entertainment and Psychological Insight Only.</Text>
    </Page>

    {/* Reading Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Natal Archetypes</Text>
        <Text style={styles.subtitle}>The Blueprint of Your Soul</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>The Sun Identity: {profile?.sun?.sign}</Text>
        <Text style={styles.text}>
          Your Sun represents your core evolutionary purpose. Located in {profile?.sun?.sign} at {profile?.sun?.degree} degrees, it calls you to embrace the archetype of the {profile?.sun?.sign} in this lifetime.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>The Emotional Inner Child: {profile?.moon?.sign}</Text>
        <Text style={styles.text}>
          Your Moon reveals your deepest attachment styles and emotional security needs. With your Moon in {profile?.moon?.sign}, your instinctual reactions are driven by navigating and protecting this specific frequency.
        </Text>
      </View>

      <View style={{ marginTop: 40 }}>
        <Text style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>
          * The full 25-page version iterates through every precise astrological aspect, transit timeline, and customized therapeutic mappings for coming years.
        </Text>
      </View>

      <Text style={styles.footer}>AstroKline Planetary Intelligence System</Text>
    </Page>
  </Document>
);

export default PremiumPDFDocument;
