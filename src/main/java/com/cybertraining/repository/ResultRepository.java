package com.cybertraining.repository;

import com.cybertraining.db.DatabaseManager;

import com.cybertraining.model.Result;

import java.util.List;

public class ResultRepository {

    private final DatabaseManager db;

    public ResultRepository(DatabaseManager db) {
        this.db = db;
    }

    public List<Result> findAll() {
        return db.getResults();
    }

    // future: persist results into DB table
    public void save(Result r) {
        db.saveResult(r);
    }

    public int countPassed() {
        int c = 0;
        for (Result r : db.getResults()) if (r.isPassed()) c++;
        return c;
    }

    public int countFailed() {
        int c = 0;
        for (Result r : db.getResults()) if (!r.isPassed()) c++;
        return c;
    }
}
