public with sharing class PromotionCreatorCtrl {
  @AuraEnabled
  public static PagedResult getProducts(
    String type,
    Integer pageNumber,
    string locatorParam
  ) {
    Integer pageSize = 5;
    // TODO FOR THE CHALLENGE:
    // If the cursor locator is being sent from the parameter, then deserialize the cursor and use the same.
    // If the locator is NOT sent from the parameter, then create a new cursor.
    // Create a cursor to get Id, Name,and cgcloud__Category__c from the Product2 object

    // Build the base SOQL for products
    String baseQuery = 'SELECT Id, Name, cgcloud__Category__c FROM Product2 ORDER BY Name';

    // Default position from pageNumber
    Integer position = (pageNumber - 1) * pageSize;

    // If caller provided a locatorParam, try to deserialize and use its position instead
    if (!String.isBlank(locatorParam)) {
      try {
        Map<String, Object> locatorMap = (Map<String, Object>) JSON.deserializeUntyped(
          locatorParam
        );
        if (locatorMap != null && locatorMap.containsKey('position')) {
          position = Integer.valueOf(
            String.valueOf(locatorMap.get('position'))
          );
        }
      } catch (Exception ex) {
        // ignore and fall back to pageNumber-derived position
      }
    }

    // Create a new cursor for the base query
    Database.Cursor cursor = Database.getCursor(baseQuery);
    Database.Cursor locator; // keep original variable name referenced in TODOs for clarity

    // Compute total and determine how many to fetch
    Integer total = 0;
    try {
      total = cursor.getNumRecords();
    } catch (Exception ex) {
      // As a safe fallback, use countQuery if cursor.getNumRecords() fails
      total = Database.countQuery('SELECT count() FROM Product2');
    }

    // TODO FOR THE CHALLENGE:
    // Define the number of records to be fetched - it is the lesser value either the page size, or the remaining records
    // integer countToFetch =

    Integer remaining = Math.max(0, total - position);
    Integer countToFetch = remaining > pageSize ? pageSize : remaining;

    PagedResult result = new PagedResult();
    result.pageSize = pageSize;
    result.pageNumber = pageNumber;

    // TODO FOR THE CHALLENGE: Fetch the total number of records, and assign the value
    // result.totalItemCount =
    result.totalItemCount = total;

    // TODO FOR THE CHALLENGE: Fetch the records and store it in result.records
    // result.records =

    // Fetch the records (if any)
    List<Product2> fetched = new List<Product2>();
    if (countToFetch > 0) {
      try {
        fetched = (List<Product2>) cursor.fetch(position, countToFetch);
      } catch (Exception ex) {
        // If cursor.fetch fails, fall back to a LIMIT/OFFSET query
        Integer offset = Math.max(0, position);
        fetched = Database.query(
          baseQuery + ' LIMIT ' + countToFetch + ' OFFSET ' + offset
        );
      }
    }

    result.records = fetched;

    // TODO FOR THE CHALLENGE: send the locator to LWC
    // result.locator =
    // Build a simple locator that encodes the next position (so LWC can pass it back)
    Integer nextPosition = position + countToFetch;
    Map<String, Object> outLocator = new Map<String, Object>{
      'position' => nextPosition,
      'pageSize' => pageSize,
      'total' => total
    };
    result.locator = JSON.serialize(outLocator);

    return result;
  }

  @AuraEnabled
  public static List<RetailStore> getRetailStores(String accountId) {
    return [
      SELECT Id, Name, RetailLocationGroup.Name
      FROM RetailStore
      WHERE AccountId = :accountId
      ORDER BY Name
    ];
  }

  /**
   * Creates a Promotion with associated Products and Channels
   * @param promotionDataJson - JSON string containing PromotionData wrapper
   * @return SaveResult - Contains success status, promotion Id, and any error messages
   */
  @AuraEnabled
  public static SaveResult savePromotion(String promotionDataJson) {
    SaveResult result = new SaveResult();
    Savepoint sp = Database.setSavepoint();

    try {
      // Parse the incoming JSON data
      PromotionData data = (PromotionData) JSON.deserialize(
        promotionDataJson,
        PromotionData.class
      );

      // Validate required fields
      if (String.isBlank(data.promotionName)) {
        throw new AuraHandledException('Promotion name is required.');
      }
      if (data.products == null || data.products.isEmpty()) {
        throw new AuraHandledException(
          'At least one product must be selected.'
        );
      }
      if (data.stores == null || data.stores.isEmpty()) {
        throw new AuraHandledException('At least one store must be selected.');
      }

      // 1. Create Promotion record
      Promotion promotion = new Promotion();
      promotion.Name = data.promotionName;
      promotion.StartDate = Date.today();
      promotion.EndDate = Date.today().addMonths(1);
      insert promotion;

      // 2. Create Promotion Product records
      List<PromotionProduct> promotionProducts = new List<PromotionProduct>();
      for (ProductData prod : data.products) {
        PromotionProduct pp = new PromotionProduct();
        pp.PromotionId = promotion.Id;
        pp.ProductId = prod.productId;
        pp.Discount_percent__c = prod.discountPercent;
        promotionProducts.add(pp);
      }

      if (!promotionProducts.isEmpty()) {
        insert promotionProducts;
      }

      // 3. Create Promotion Channel records (linking to stores)
      List<PromotionChannel> promotionChannels = new List<PromotionChannel>();
      for (StoreData store : data.stores) {
        PromotionChannel pc = new PromotionChannel();
        pc.PromotionId = promotion.Id;
        pc.RetailStoreId = store.storeId;
        pc.StartDate = Date.today();
        pc.AccountId = data.accountId;
        promotionChannels.add(pc);
      }

      if (!promotionChannels.isEmpty()) {
        insert promotionChannels;
      }

      // Build success result
      result.success = true;
      result.promotionId = promotion.Id;
      result.promotionName = promotion.Name;
      result.message =
        'Promotion created successfully with ' +
        promotionProducts.size() +
        ' product(s) and ' +
        promotionChannels.size() +
        ' store(s).';
    } catch (DmlException e) {
      Database.rollback(sp);
      result.success = false;
      result.message = 'Database error: ' + e.getDmlMessage(0);
      throw new AuraHandledException(result.message);
    } catch (Exception e) {
      Database.rollback(sp);
      result.success = false;
      result.message = 'Error creating promotion: ' + e.getMessage();
      throw new AuraHandledException(result.message);
    }

    return result;
  }

  // ========================================
  // WRAPPER CLASSES
  // ========================================

  public class PagedResult {
    @AuraEnabled
    public Integer pageSize;
    @AuraEnabled
    public Integer pageNumber;
    @AuraEnabled
    public Integer totalItemCount;
    @AuraEnabled
    public List<Product2> records;
    @AuraEnabled
    public String locator;
  }

  // Input wrapper for promotion data from LWC
  public class PromotionData {
    @AuraEnabled
    public String promotionName;
    @AuraEnabled
    public String accountId;
    @AuraEnabled
    public String templateId;
    @AuraEnabled
    public Date startDate;
    @AuraEnabled
    public Date endDate;
    @AuraEnabled
    public List<ProductData> products;
    @AuraEnabled
    public List<StoreData> stores;
  }

  public class ProductData {
    @AuraEnabled
    public String productId;
    @AuraEnabled
    public String productName;
    @AuraEnabled
    public String category;
    @AuraEnabled
    public Decimal discountPercent;
  }

  public class StoreData {
    @AuraEnabled
    public String storeId;
    @AuraEnabled
    public String storeName;
    @AuraEnabled
    public String locationGroup;
  }

  // Output wrapper for save result
  public class SaveResult {
    @AuraEnabled
    public Boolean success;
    @AuraEnabled
    public String promotionId;
    @AuraEnabled
    public String promotionName;
    @AuraEnabled
    public String message;
  }
}
