/**
 * Seed script for PaydMap database. Populates the database with sample
 * categories and places across various Russian cities. This file can be
 * executed with ts-node or compiled with tsc and run with node.
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // Define some base categories.
  const categories = [
    { name: 'Cheap Food', description: 'Affordable eats and street food' },
    { name: 'Hidden Gem', description: 'Secret spots loved by locals' },
    { name: 'Hostel', description: 'Budget accommodation for travellers' },
    { name: 'Hotel', description: 'Comfortable stays at reasonable prices' },
    { name: 'Auto Service', description: 'Mechanics, tire shops and car care' }
  ];

  // Upsert categories; returns inserted rows with IDs.
  const { data: insertedCategories, error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'name' })
    .select('*');
  if (catError) throw catError;

  // Map category names to IDs for later lookup.
  const catMap: Record<string, string> = {};
  insertedCategories?.forEach((cat) => {
    catMap[cat.name] = cat.id;
  });

  // Define sample cities with approximate coordinates.
  const cities: { name: string; lat: number; lng: number }[] = [
    { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
    { name: 'Saint Petersburg', lat: 59.9343, lng: 30.3351 },
    { name: 'Novosibirsk', lat: 55.0084, lng: 82.9357 },
    { name: 'Yekaterinburg', lat: 56.8389, lng: 60.6057 },
    { name: 'Kazan', lat: 55.8304, lng: 49.0661 }
  ];

  // Generate random places around each city.
  const places = [] as any[];
  cities.forEach((city) => {
    for (let i = 0; i < 10; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.1; // ±0.05 degrees (~5km)
      const offsetLng = (Math.random() - 0.5) * 0.1;
      const lat = city.lat + offsetLat;
      const lng = city.lng + offsetLng;
      const categoryNames = Object.keys(catMap);
      const catName = categoryNames[Math.floor(Math.random() * categoryNames.length)];
      const categoryId = catMap[catName];
      places.push({
        id: randomUUID(),
        name: `${catName} ${i + 1} in ${city.name}`,
        description: `A sample ${catName.toLowerCase()} located in ${city.name}.`,
        category_id: categoryId,
        address: `${city.name} Centre`,
        latitude: lat,
        longitude: lng,
        price_level: parseFloat((Math.random() * 1000).toFixed(2)),
        rating: 0,
        rating_count: 0
      });
    }
  });

  // Insert places in batches to avoid hitting row limits.
  const chunkSize = 50;
  for (let i = 0; i < places.length; i += chunkSize) {
    const chunk = places.slice(i, i + chunkSize);
    const { error } = await supabase.from('places').insert(chunk);
    if (error) throw error;
  }
  console.log(`Seeded ${places.length} places across ${cities.length} cities.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});