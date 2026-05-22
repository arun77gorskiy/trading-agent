import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Modal } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, Place, Review } from '@/lib/api';
import { colors, spacing, fontSizes } from '@/theme';

export default function PlaceDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<Place & { reviews?: Review[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    async function fetchPlace() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.getPlaceById(id);
        setPlace(res.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlace();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!id) return;
    try {
      // In production you'll get the current user ID from auth context
      const userId = '00000000-0000-0000-0000-000000000000';
      await api.submitReview({ user_id: userId, place_id: id, rating: reviewRating, comment: reviewComment });
      setReviewModalVisible(false);
      setReviewComment('');
      // Refresh place data to show new review
      const res = await api.getPlaceById(id);
      setPlace(res.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (error || !place) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.error }}>{error || 'Place not found'}</Text>
      </View>
    );
  }
  const region: Region = {
    latitude: place.latitude,
    longitude: place.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <TouchableOpacity onPress={router.back} style={{ padding: spacing.md }}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ paddingHorizontal: spacing.md }}>
          <Text style={styles.title}>{place.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm }}>
            <Ionicons name="star" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, marginLeft: 4 }}>
              {place.rating?.toFixed(1) || '0.0'} ({place.rating_count || 0})
            </Text>
          </View>
          {place.address && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <Ionicons name="location" size={16} color={colors.secondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 4 }}>{place.address}</Text>
            </View>
          )}
          {place.description && (
            <Text style={{ color: colors.textPrimary, marginBottom: spacing.md }}>{place.description}</Text>
          )}
        </View>
        {/* Map snippet */}
        <View style={{ height: 200, marginHorizontal: spacing.md, borderRadius: 8, overflow: 'hidden' }}>
          <MapView style={{ flex: 1 }} region={region} scrollEnabled={false} zoomEnabled={false} rotateEnabled={false} pitchEnabled={false} customMapStyle={mapSnippetStyle}>
            <Marker coordinate={{ latitude: place.latitude, longitude: place.longitude }} />
          </MapView>
        </View>
        {/* Reviews */}
        <View style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
              <Text style={{ color: colors.primary }}>Write a review</Text>
            </TouchableOpacity>
          </View>
          {place.reviews && place.reviews.length > 0 ? (
            place.reviews.map((review) => (
              <View key={review.id} style={{ marginTop: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color={colors.primary}
                    />
                  ))}
                  <Text style={{ color: colors.textSecondary, marginLeft: 8, fontSize: fontSizes.sm }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {review.comment && (
                  <Text style={{ color: colors.textPrimary, marginTop: 4 }}>{review.comment}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>No reviews yet.</Text>
          )}
        </View>
      </ScrollView>
      {/* Review Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="slide" onRequestClose={() => setReviewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <View style={{ flexDirection: 'row', marginVertical: spacing.sm }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} onPress={() => setReviewRating(i)}>
                  <Ionicons
                    name={i <= reviewRating ? 'star' : 'star-outline'}
                    size={24}
                    color={colors.primary}
                    style={{ marginHorizontal: 2 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Share your experience…"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={reviewComment}
              onChangeText={setReviewComment}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md }}>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={{ marginRight: spacing.sm }}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmitReview}>
                <Text style={{ color: colors.primary }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const mapSnippetStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1c1c1c' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#333333' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }]
  }
];

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '700'
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600'
  },
  textArea: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    borderRadius: 8,
    padding: spacing.sm,
    height: 100,
    textAlignVertical: 'top'
  }
});