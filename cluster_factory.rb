FactoryBot.define do
  factory :cluster do
    sequence(:order_id)
    version  { 1 }
    sub_version { 1 }

    factory :cluster_with_cluster_rules do
      transient do
        cluster_rules_count { 5 }
      end

      after(:create) do |new_cluster, evaluator|
        create_list(
          :cluster_rule,
          evaluator.cluster_rules_count,
          cluster: new_cluster
        )
        new_cluster.reload
      end
    end

    factory :cluster_without_cluster_rules do
    end
  end
end
