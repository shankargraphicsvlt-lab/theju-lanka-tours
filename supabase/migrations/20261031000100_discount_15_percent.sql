-- Discount on the tour rate changed from 25% to 15% (owner's decision, 2026-10-31).
-- Mirrors DISCOUNT_PERCENT in src/config/site.ts. The database calculates every
-- enquiry estimate from this row, so it must match the website.
-- Existing bookings keep the estimate snapshot taken when they were submitted.
update public.pricing_settings
set discount_percent = 15
where id = 1;
