@JsonAccess(serializable='always' deserializable='always')
global class ComplianceMetrics {
  @AuraEnabled
  global Decimal targetPrice;

  @AuraEnabled
  global Decimal observedPrice;

  @AuraEnabled
  global Decimal priceGap;

  @AuraEnabled
  global String statusMessage;

  @AuraEnabled
  global String statusColor;

  @AuraEnabled
  global Boolean isSuccess;

  @AuraEnabled
  global String errorMessage;

  @AuraEnabled
  global Decimal penalty;

  @AuraEnabled
  global String storeType;

  @AuraEnabled
  global String storeName;

  @AuraEnabled
  global String productName;

  global ComplianceMetrics(
    Decimal targetPrice,
    Decimal observedPrice,
    Decimal priceGap,
    String statusMessage,
    String statusColor,
    Boolean isSuccess,
    String errorMessage
  ) {
    this.targetPrice = targetPrice;
    this.observedPrice = observedPrice;
    this.priceGap = priceGap;
    this.statusMessage = statusMessage;
    this.statusColor = statusColor;
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
    this.penalty = null;
    this.storeType = null;
    this.storeName = null;
    this.productName = null;
  }

  global ComplianceMetrics(
    Decimal targetPrice,
    Decimal observedPrice,
    Decimal priceGap,
    String statusMessage,
    String statusColor,
    Boolean isSuccess,
    String errorMessage,
    Decimal penalty,
    String storeType
  ) {
    this.targetPrice = targetPrice;
    this.observedPrice = observedPrice;
    this.priceGap = priceGap;
    this.statusMessage = statusMessage;
    this.statusColor = statusColor;
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
    this.penalty = penalty;
    this.storeType = storeType;
    this.storeName = null;
    this.productName = null;
  }

  global ComplianceMetrics(
    Decimal targetPrice,
    Decimal observedPrice,
    Decimal priceGap,
    String statusMessage,
    String statusColor,
    Boolean isSuccess,
    String errorMessage,
    Decimal penalty,
    String storeType,
    String storeName,
    String productName
  ) {
    this.targetPrice = targetPrice;
    this.observedPrice = observedPrice;
    this.priceGap = priceGap;
    this.statusMessage = statusMessage;
    this.statusColor = statusColor;
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
    this.penalty = penalty;
    this.storeType = storeType;
    this.storeName = storeName;
    this.productName = productName;
  }
}
