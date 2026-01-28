@isTest
private class PromotionCreatorCtrlTest {
  @isTest
  static void testCursorPagination() {
    // Create 12 Product2 records
    List<Product2> products = new List<Product2>();
    for (Integer i = 0; i < 12; i++) {
      products.add(new Product2(Name = 'TstProd ' + i));
    }
    insert products;

    Test.startTest();
    PromotionCreatorCtrl.PagedResult page1 = PromotionCreatorCtrl.getProducts(
      null,
      1,
      null
    );
    Test.stopTest();

    System.assertEquals(5, page1.pageSize, 'pageSize should be 5');
    System.assertEquals(1, page1.pageNumber, 'pageNumber should be 1');
    System.assertEquals(12, page1.totalItemCount, 'total count');
    System.assertEquals(
      5,
      page1.records.size(),
      'first page should have 5 records'
    );
    System.assertNotEquals(null, page1.locator, 'locator should be returned');

    // Deserialize locator and ensure next position is 5
    Map<String, Object> loc = (Map<String, Object>) JSON.deserializeUntyped(
      page1.locator
    );
    Integer nextPos = Integer.valueOf(String.valueOf(loc.get('position')));
    System.assertEquals(
      5,
      nextPos,
      'next position after first page should be 5'
    );

    // Fetch page 2 using locator
    Test.startTest();
    PromotionCreatorCtrl.PagedResult page2 = PromotionCreatorCtrl.getProducts(
      null,
      2,
      page1.locator
    );
    Test.stopTest();

    System.assertEquals(
      5,
      page2.records.size(),
      'second page should have 5 records'
    );
    Map<String, Object> loc2 = (Map<String, Object>) JSON.deserializeUntyped(
      page2.locator
    );
    Integer nextPos2 = Integer.valueOf(String.valueOf(loc2.get('position')));
    System.assertEquals(
      10,
      nextPos2,
      'next position after second page should be 10'
    );

    // Fetch page 3 using locator (last page)
    Test.startTest();
    PromotionCreatorCtrl.PagedResult page3 = PromotionCreatorCtrl.getProducts(
      null,
      3,
      page2.locator
    );
    Test.stopTest();

    System.assertEquals(
      2,
      page3.records.size(),
      'third page should have 2 records'
    );
    Map<String, Object> loc3 = (Map<String, Object>) JSON.deserializeUntyped(
      page3.locator
    );
    Integer nextPos3 = Integer.valueOf(String.valueOf(loc3.get('position')));
    System.assertEquals(
      12,
      nextPos3,
      'next position after last page should equal total'
    );
  }
}
