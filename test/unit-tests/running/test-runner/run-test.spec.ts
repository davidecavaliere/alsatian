import { AsyncTest, Timeout, Expect, SpyOn, METADATA_KEYS } from "../../../../core/alsatian-core";
import { TestRunner } from "../../../../core/running/test-runner";
import { TestSetBuilder } from "../../../builders/test-set-builder";
import { TestFixtureBuilder } from "../../../builders/test-fixture-builder";
import { TestBuilder } from "../../../builders/test-builder";
import { TestOutputStream } from "../../../../core/test-output-stream";
import { ITestCompleteEvent } from "../../../../core/events";
import "reflect-metadata";

export class RunTestTests {

   @AsyncTest()
   public async singlePassingTestRunsSuccessfully() {

      const test = new TestBuilder().withTestCaseCount(1).build();

      const testFixture = new TestFixtureBuilder()
                                 .addTest(test)
                                 .build();

      const testSet = new TestSetBuilder()
                           .addTestFixture(testFixture)
                           .build();

      const outputStream = new TestOutputStream();
      SpyOn(outputStream, "push");

      const testRunner = new TestRunner(outputStream);

      await testRunner.run(testSet);
      Expect(outputStream.push).toHaveBeenCalledWith("ok 1 Test Function\n");
   }

    @AsyncTest()
    public singlePassingTestRunsSuccessfullyWithOnCompleteEventRaised() {
        let testCompletedValue: ITestCompleteEvent = null;
        const test = new TestBuilder().withTestCaseCount(1).build();

        const testFixture = new TestFixtureBuilder()
            .addTest(test)
            .build();

        const testSet = new TestSetBuilder()
            .addTestFixture(testFixture)
            .build();

        const outputStream = new TestOutputStream();

        const testRunner = new TestRunner(outputStream);

        let spyContainer = {
            onCompleteCB: (testCompleted: ITestCompleteEvent) => {
                testCompletedValue = testCompleted;
            }
        };

        testRunner.onTestComplete(spyContainer.onCompleteCB);

        return new Promise((resolve, reject) => {
            testRunner.run(testSet)
                .then(result => {
                    Expect(testCompletedValue).not.toBeNull();
                    // Expect(testCompletedValue.currentTestIndex).toEqual(1);
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    @AsyncTest()
    public singlePassingTestRunsSuccessfullyWithoutOnCompleteEventRaised() {
        let testCompletedValue: ITestCompleteEvent = null;
        const test = new TestBuilder().withTestCaseCount(1).build();

        const testFixture = new TestFixtureBuilder()
            .addTest(test)
            .build();

        const testSet = new TestSetBuilder()
            .addTestFixture(testFixture)
            .build();

        const outputStream = new TestOutputStream();

        const testRunner = new TestRunner(outputStream);

        let spyContainer = {
            onCompleteCB: (testCompleted: ITestCompleteEvent) => {
                testCompletedValue = testCompleted;
            }
        };

        return new Promise((resolve, reject) => {
            testRunner.run(testSet)
                .then(result => {
                    Expect(testCompletedValue).toBeNull();
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

   @AsyncTest()
   @Timeout(600)
   public async singleTestTakes501msFails() {

      const test = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("testFunction")
                        .withIsAsync(true)
                        .build();

      const fixtureObject = {
         testFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 501));
         }
      };

      const testFixture = new TestFixtureBuilder()
                                 .withFixture(fixtureObject)
                                 .addTest(test)
                                 .build();

      const testSet = new TestSetBuilder()
                           .addTestFixture(testFixture)
                           .build();

      const outputStream = new TestOutputStream();
      SpyOn(outputStream, "push");

      const testRunner = new TestRunner(outputStream);

      await testRunner.run(testSet);
      Expect(outputStream.push).toHaveBeenCalledWith("not ok 1 Test Function\n");
   }

   @AsyncTest()
   public async singleTestTakes100msWith50msTimeoutFails() {

      const test = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("testFunction")
                        .withIsAsync(true)
                        .build();

      const fixtureObject = {
         testFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 100));
         }
      };

      const testFixture = new TestFixtureBuilder()
                                 .withFixture(fixtureObject)
                                 .addTest(test)
                                 .build();

      const testSet = new TestSetBuilder()
                           .addTestFixture(testFixture)
                           .build();

      const outputStream = new TestOutputStream();
      SpyOn(outputStream, "push");

      const testRunner = new TestRunner(outputStream);

      await testRunner.run(testSet, 50);
      Expect(outputStream.push).toHaveBeenCalledWith("not ok 1 Test Function\n");
   }

   @AsyncTest()
   public async singleTestThrowsErrorFails() {

      const test = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("testFunction")
                        .build();

      const fixtureObject = {
         setupFunction: () => { throw new Error("setup failed"); },
         testFunction: () => {
            throw new Error("everything has blown up");
         }
      };

      Reflect.defineMetadata(METADATA_KEYS.TEARDOWN, [ "setupFunction" ], fixtureObject);

      const testFixture = new TestFixtureBuilder()
                                 .withFixture(fixtureObject)
                                 .addTest(test)
                                 .build();

      const testSet = new TestSetBuilder()
                           .addTestFixture(testFixture)
                           .build();

      const outputStream = new TestOutputStream();
      SpyOn(outputStream, "push");

      const testRunner = new TestRunner(outputStream);

      await testRunner.run(testSet);
      Expect(outputStream.push).toHaveBeenCalledWith("not ok 1 Test Function\n");
   }

   @AsyncTest()
   public async twoPassingTestsRunsSuccessfully() {

      const firstTest = new TestBuilder().withTestCaseCount(1).build();
      const secondTest = new TestBuilder().withTestCaseCount(1).build();

      const testFixture = new TestFixtureBuilder()
                                 .addTest(firstTest)
                                 .addTest(secondTest)
                                 .build();

      const testSet = new TestSetBuilder()
                           .addTestFixture(testFixture)
                           .build();

      const outputStream = new TestOutputStream();
      SpyOn(outputStream, "push");

      const testRunner = new TestRunner(outputStream);

      await testRunner.run(testSet);
      Expect(outputStream.push).toHaveBeenCalledWith("ok 1 Test Function\n");
      Expect(outputStream.push).toHaveBeenCalledWith("ok 2 Test Function\n");
   }

   @AsyncTest()
   @Timeout(1000)
   public async twoTestsFirstTakes501msFails() {

      const firstTest = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("firstTestFunction")
                        .withIsAsync(true)
                        .build();

      const secondTest = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("secondTestFunction")
                        .withIsAsync(true)
                        .build();

      const fixtureObject = {
         firstTestFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 501));
         },
         secondTestFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 10));
         }
      };

      const testFixture = new TestFixtureBuilder()
                                 .withFixture(fixtureObject)
                                 .addTest(firstTest)
                                 .addTest(secondTest)
                                 .build();

      const testSet = new TestSetBuilder()
                           .addTestFixture(testFixture)
                           .build();

      const outputStream = new TestOutputStream();
      SpyOn(outputStream, "push");

      const testRunner = new TestRunner(outputStream);

      await testRunner.run(testSet);
      Expect(outputStream.push).toHaveBeenCalledWith("not ok 1 Test Function\n");
      Expect(outputStream.push).toHaveBeenCalledWith("ok 2 Test Function\n");
   }

   @AsyncTest()
   @Timeout(1000)
   public async twoTestsSecondTakes501msFails() {

      const firstTest = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("firstTestFunction")
                        .withIsAsync(true)
                        .build();

      const secondTest = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("secondTestFunction")
                        .withIsAsync(true)
                        .build();

      const fixtureObject = {
         firstTestFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 10));
         },
         secondTestFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 501));
         }
      };

      const testFixture = new TestFixtureBuilder()
                                 .withFixture(fixtureObject)
                                 .addTest(firstTest)
                                 .addTest(secondTest)
                                 .build();

      const testSet = new TestSetBuilder()
                           .addTestFixture(testFixture)
                           .build();

      const outputStream = new TestOutputStream();
      SpyOn(outputStream, "push");

      const testRunner = new TestRunner(outputStream);

      await testRunner.run(testSet);
      Expect(outputStream.push).toHaveBeenCalledWith("ok 1 Test Function\n");
      Expect(outputStream.push).toHaveBeenCalledWith("not ok 2 Test Function\n");
   }

   @AsyncTest()
   public async twoTestsFirstTakes100msWith50msTimeoutFails() {

      const firstTest = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("firstTestFunction")
                        .withIsAsync(true)
                        .build();

      const secondTest = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("secondTestFunction")
                        .withIsAsync(true)
                        .build();

      const fixtureObject = {
         firstTestFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 100));
         },
         secondTestFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 10));
         }
      };

      const testFixture = new TestFixtureBuilder()
                                 .withFixture(fixtureObject)
                                 .addTest(firstTest)
                                 .addTest(secondTest)
                                 .build();

      const testSet = new TestSetBuilder()
                           .addTestFixture(testFixture)
                           .build();

      const outputStream = new TestOutputStream();
      SpyOn(outputStream, "push");

      const testRunner = new TestRunner(outputStream);

      await testRunner.run(testSet, 50);
      Expect(outputStream.push).toHaveBeenCalledWith("not ok 1 Test Function\n");
      Expect(outputStream.push).toHaveBeenCalledWith("ok 2 Test Function\n");
   }

   @AsyncTest()
   public async twoTestsSecondTakes100msWith50msTimeoutFails() {

      const firstTest = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("firstTestFunction")
                        .withIsAsync(true)
                        .build();

      const secondTest = new TestBuilder()
                        .withTestCaseCount(1)
                        .withKey("secondTestFunction")
                        .withIsAsync(true)
                        .build();

      const fixtureObject = {
         firstTestFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 10));
         },
         secondTestFunction: () => {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 100));
         }
      };

      const testFixture = new TestFixtureBuilder()
                                 .withFixture(fixtureObject)
                                 .addTest(firstTest)
                                 .addTest(secondTest)
                                 .build();

      const testSet = new TestSetBuilder()
                           .addTestFixture(testFixture)
                           .build();

      const outputStream = new TestOutputStream();
      SpyOn(outputStream, "push");

      const testRunner = new TestRunner(outputStream);

      await testRunner.run(testSet, 50);
      Expect(outputStream.push).toHaveBeenCalledWith("ok 1 Test Function\n");
      Expect(outputStream.push).toHaveBeenCalledWith("not ok 2 Test Function\n");
   }
}
