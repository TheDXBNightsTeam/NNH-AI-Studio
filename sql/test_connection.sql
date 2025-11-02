-- Test connection query
SELECT 
  'Connection Test' as test_type,
  'Success' as status,
  COUNT(*) as total_accounts
FROM gmb_accounts;

