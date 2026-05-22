import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { api, Place } from '@/lib/api';
import { Link } from 'expo-router';
import { colors, spacing, fontSizes } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      setLoading(true);
      api
        .searchPlaces({ q: query })
        .then((res) => {
          setResults(res.data);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md }}>
        <Text style={{ color: colors.primary, fontSize: fontSizes.lg, fontWeight: 'bold' }}>Search</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginHorizontal: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Search for places"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>
      {error ? (
        <View style={{ alignItems: 'center', padding: spacing.md }}>
          <Text style={{ color: colors.error }}>{error}</Text>
        </View>
      ) : loading ? (
        <View style={{ padding: spacing.md }}>
          <Text style={{ color: colors.textSecondary }}>Searching…</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <Link href={`/places/${item.id}`} asChild>
              <TouchableOpacity style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: spacing.md,
    paddingVertical: spacing.xs
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    paddingVertical: spacing.xs
  },
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600'
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginTop: 4
  }
});