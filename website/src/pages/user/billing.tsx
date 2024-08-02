import React, { useState, useEffect } from 'react';

import Header from '@/components/Header';
import withAuth from '@/middleware/WithAuth';
import { getMySubscription } from '@/services/UserService';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { Subscription } from '@/types/models/Billing';
import Footer from '@/components/Footer';
import Metadata from '@/components/Metadata';

const BillingVisualization: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | undefined>();
  const [isFullyUtilized, setIsFullyUtilized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await getMySubscription();
      setSubscription(response.data.subscription);

      const { utilization, limits } = response.data.subscription;
      const isFullyUtilized =
        utilization.eventsCreated >= limits.maxEvents ||
        utilization.responses >= limits.maxMonthlyResponses ||
        utilization.pipelineRuns >= limits.maxMonthlyPipelineRuns;

      setIsFullyUtilized(isFullyUtilized);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !subscription) {
    return <LoadingSpinner />;
  }

  const { limits, utilization } = subscription;

  return (
    <>
      <Metadata title="Billing Visualization | ApplicantAtlas" />
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
        <Header
          menuItems={[{ label: 'My Dashboard', href: '/user/dashboard' }]}
          showUserProfile={true}
        />
        <div className="container mx-auto px-4 py-8">
          <div role="alert" className="alert alert-info mb-2">
            <span>
              Are you running a non-profit event? Email{' '}
              <a href="">hello@applicantatlas.com</a> to apply for a free plan!
            </span>
          </div>
          {isFullyUtilized && (
            <div role="alert" className="alert alert-error mb-2">
              <span>
                You&apos;ve run out of credits, users will experience
                interruptions if you don&apos;t upgrade.
              </span>
            </div>
          )}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Billing Utilization
          </h2>
          <div className="grid gap-6">
            <div>
              <h3 className="text-lg font-medium">Events Created</h3>
              <progress
                className="progress progress-primary w-full"
                value={utilization.eventsCreated}
                max={limits.maxEvents}
              ></progress>
              <p>
                {utilization.eventsCreated} / {limits.maxEvents}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Monthly Responses</h3>
              <progress
                className="progress progress-primary w-full"
                value={utilization.responses}
                max={limits.maxMonthlyResponses}
              ></progress>
              <p>
                {utilization.responses} / {limits.maxMonthlyResponses}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Monthly Pipeline Runs</h3>
              <progress
                className="progress progress-primary w-full"
                value={utilization.pipelineRuns}
                max={limits.maxMonthlyPipelineRuns}
              ></progress>
              <p>
                {utilization.pipelineRuns} / {limits.maxMonthlyPipelineRuns}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default withAuth(BillingVisualization);
