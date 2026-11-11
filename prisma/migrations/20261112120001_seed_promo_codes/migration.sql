INSERT INTO "Offer" ("id", "name", "description", "badge", "kind", "value", "eligibility", "requiresCode", "isActive", "code", "maxRedemptions", "currentRedemptions", "termsAndConditions", "minOrderAmount", "createdAt")
VALUES
  (gen_random_uuid()::text, 'Welcome 10% Off', 'Get 10% off your first order at BeU Eyewear!', '10% Off', 'PERCENT', 10, 'FIRST_ORDER', true, true, 'WELCOME10', NULL, 0, 'Valid on your first order only. Cannot be combined with other offers. Applies to the order subtotal before shipping.', NULL, NOW()),
  (gen_random_uuid()::text, 'Save ₱150', 'Save ₱150 on orders ₱1,000 and above.', '₱150 Off', 'FIXED_AMOUNT', 150, 'NONE', true, true, 'SAVE150', NULL, 0, 'Minimum order of ₱1,000 required. One use per customer. Cannot be combined with other offers.', 1000, NOW()),
  (gen_random_uuid()::text, 'Free Shipping', 'Enjoy free standard shipping on your order.', 'Free Ship', 'FIXED_AMOUNT', 0, 'NONE', true, true, 'FREESHIP', NULL, 0, 'Waives standard shipping fee. Express shipping is not included. One use per customer.', NULL, NOW()),
  (gen_random_uuid()::text, 'BeU 20% Off', 'Limited-time 20% discount — only 50 available!', '20% Off', 'PERCENT', 20, 'NONE', true, true, 'BEU20', 50, 0, 'Limited to 50 redemptions total. One use per customer. Cannot be combined with other offers. Applies to the order subtotal before shipping.', NULL, NOW())
ON CONFLICT DO NOTHING;
