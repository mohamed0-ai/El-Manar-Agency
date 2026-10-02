import { Router } from 'express';
import { dbHelpers } from '../db/index.js';

const router = Router();

router.post('/ac-room', (req, res) => {
  try {
    const {
      length, width, height = 2.8,
      is_top_floor = false,
      sun_exposure = 'normal', // 'low', 'normal', 'high_sun'
      occupants_count = 2,
      has_large_glass = false,
      daily_usage_hours = 8
    } = req.body;

    const l = Math.max(1, Number(length) || 4);
    const w = Math.max(1, Number(width) || 3.5);
    const h = Math.max(2.4, Number(height) || 2.8);

    const area = l * w;
    const volume = area * h;

    // Base BTU calculation: standard in Egypt is ~800 BTU per square meter for standard ceiling, or volume x 250
    let baseBtu = area * 800;

    // Multipliers for climate in Upper Egypt (Assiut)
    let multiplier = 1.0;
    if (is_top_floor) multiplier += 0.20; // +20% for direct roof heat transfer
    if (sun_exposure === 'high_sun') multiplier += 0.15; // +15% for west-facing or unshaded walls
    if (has_large_glass) multiplier += 0.10; // +10% for large sunlit windows

    // Extra heat load for people (> 2 people adds 500 BTU each)
    const extraOccupants = Math.max(0, Number(occupants_count) - 2);
    const extraBtu = extraOccupants * 500;

    const totalRequiredBtu = Math.round((baseBtu * multiplier) + extraBtu);

    // Determine recommended Horsepower
    let recommendedHp = 1.5;
    let hpLabel = '1.5 حصان';
    let hpRangeDesc = 'مناسب لغرف النوم والمساحات حتى 14 متر مربع';

    if (totalRequiredBtu <= 12500) {
      recommendedHp = 1.5;
      hpLabel = '1.5 حصان (12,000 BTU)';
      hpRangeDesc = 'مثالي للغرف الصغيرة والمتوسطة حتى 14 م²';
    } else if (totalRequiredBtu <= 18500) {
      recommendedHp = 2.25;
      hpLabel = '2.25 حصان (18,000 BTU)';
      hpRangeDesc = 'مثالي لغرف المعيشة والغرف الكبيرة من 15 إلى 22 م²';
    } else if (totalRequiredBtu <= 24500) {
      recommendedHp = 3.0;
      hpLabel = '3.0 حصان (24,000 BTU)';
      hpRangeDesc = 'مناسب للصالات والريسبشن والمساحات المفتوحة من 23 إلى 30 م²';
    } else if (totalRequiredBtu <= 32500) {
      recommendedHp = 4.0;
      hpLabel = '4.0 حصان (32,000 BTU)';
      hpRangeDesc = 'مناسب للمساحات الكبيرة والشركات من 31 إلى 40 م²';
    } else if (totalRequiredBtu <= 42000) {
      recommendedHp = 5.0;
      hpLabel = '5.0 حصان (36,000 - 40,000 BTU)';
      hpRangeDesc = 'مناسب للمقرات الإدارية وقاعات الاجتماعات من 41 إلى 55 م²';
    } else {
      recommendedHp = 8.0;
      hpLabel = 'نظام مركزي متطور VRF / كونسيلد 8+ حصان';
      hpRangeDesc = 'مساحات شاسعة وقاعات كبرى ومصانع - تتطلب استشارة هندسية لتوريد نظام مركزي أو متعدد';
    }

    const recommendInverter = Number(daily_usage_hours) >= 6;
    const energyAdvice = recommendInverter
      ? 'نظراً لأنك تستخدم التكييف أكثر من 6 ساعات يومياً، نوصي بشدة باختيار تكييف (انفرتر Inverter) لتوفير حتى 50% من فاتورة الكهرباء شهرياً.'
      : 'للاستخدام المتقطع، يمكن اختيار تكييف قياسي (ستاندرد) أو انفرتر حسب الميزانية المفضلة.';

    // Fetch matching products from the database
    let matchingProducts = [];
    if (recommendedHp <= 5.0) {
      matchingProducts = dbHelpers.all(
        `SELECT p.*, b.name as brand_name
         FROM products p
         LEFT JOIN brands b ON p.brand_id = b.id
         WHERE p.category_id = 1 AND p.horsepower = ?
         ORDER BY p.is_inverter DESC, p.price ASC
         LIMIT 6`,
        [recommendedHp]
      );
    } else {
      matchingProducts = dbHelpers.all(
        `SELECT p.*, b.name as brand_name
         FROM products p
         LEFT JOIN brands b ON p.brand_id = b.id
         WHERE p.category_id = 1 AND (p.horsepower >= 5.0 OR p.horsepower IS NULL)
         LIMIT 6`
      );
    }

    res.json({
      success: true,
      calculation: {
        room_area: Math.round(area * 10) / 10,
        room_volume: Math.round(volume * 10) / 10,
        required_btu: totalRequiredBtu,
        recommended_hp: recommendedHp,
        hp_label: hpLabel,
        hp_range_desc: hpRangeDesc,
        recommend_inverter: recommendInverter,
        energy_advice: energyAdvice,
        climate_zone: 'أسيوط وصعيد مصر (درجات حرارة قصوى صيفاً - تتطلب كفاءة تبريد عالية)'
      },
      matching_products: matchingProducts.map(p => ({
        ...p,
        specs: p.specs_json ? JSON.parse(p.specs_json) : {},
        images: p.images_array ? JSON.parse(p.images_array) : []
      }))
    });
  } catch (err) {
    console.error('Calculator error:', err);
    res.status(500).json({ success: false, error: 'حدث خطأ في عملية الحساب' });
  }
});

export default router;
