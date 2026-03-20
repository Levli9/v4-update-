package com.cybertraining.service;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.repository.ResultRepository;

public class DashboardService {

    private final ResultRepository resultRepo;
    private final DatabaseManager db;

    public DashboardService(DatabaseManager db) {
        this.db = db;
        this.resultRepo = new ResultRepository(db);
    }

    public int getTotalEmployees() {
        try {
            int c = db.getUserCount();
            return Math.max(1, c);
        } catch (Exception ex) {
            // fallback to estimate from results
            var list = resultRepo.findAll();
            return Math.max(1, list.size());
        }
    }

    public int getPassedCount() {
        return resultRepo.countPassed();
    }

    public int getFailedCount() {
        return resultRepo.countFailed();
    }

    public int getAverageScore() {
        var list = resultRepo.findAll();
        if (list.isEmpty()) return 0;
        int sum = 0;
        for (var r : list) sum += r.getScore();
        return Math.round((float) sum / list.size());
    }

    public int[] getScoreDistribution() {
        // buckets: 0-60,61-70,71-80,81-90,91-100
        int[] buckets = new int[5];
        var list = resultRepo.findAll();
        for (var r : list) {
            int s = r.getScore();
            if (s <= 60) buckets[0]++;
            else if (s <= 70) buckets[1]++;
            else if (s <= 80) buckets[2]++;
            else if (s <= 90) buckets[3]++;
            else buckets[4]++;
        }
        return buckets;
    }

    public int[] getMonthlyTrend(int months) {
        // return counts per month for the last `months` months (most recent last)
        int[] trend = new int[Math.max(1, months)];
        var list = resultRepo.findAll();
        // compute month index for each result relative to now
        java.util.Calendar calNow = java.util.Calendar.getInstance();
        for (var r : list) {
            java.util.Calendar c = java.util.Calendar.getInstance();
            c.setTimeInMillis(r.getTimestamp());
            int diffMonths = (calNow.get(java.util.Calendar.YEAR) - c.get(java.util.Calendar.YEAR)) * 12
                    + (calNow.get(java.util.Calendar.MONTH) - c.get(java.util.Calendar.MONTH));
            if (diffMonths >= 0 && diffMonths < months) {
                // place into array at position months-1-diffMonths so most recent is last
                int idx = months - 1 - diffMonths;
                trend[idx]++;
            }
        }
        return trend;
    }
}
