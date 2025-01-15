package expo.modules.idnowlibrary;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import de.idnow.core.IDnowConfig;
import de.idnow.core.IDnowResult;
import de.idnow.core.IDnowSDK;

public class IDNowStartActivity extends Activity implements IDnowSDK.IDnowResultListener {
    private String result;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = getIntent();
        String token = intent.getStringExtra("token");
        startToken(token);
    }

    private void startToken(String token ){
        IDnowConfig idnowConfig = IDnowConfig.Builder.getInstance().withLanguage("en").build();

        IDnowSDK idnowSdk = IDnowSDK.getInstance();
        idnowSdk.initialize(this, idnowConfig);
        String identId = token.toUpperCase();
        idnowSdk.startIdent(identId, this);
    }

    @Override
    public void onIdentResult(IDnowResult iDnowResult) {
        if (iDnowResult.getResultType() == IDnowResult.ResultType.FINISHED) {
            Log.d("", "Finished");
            result = "finished";
        } else if (iDnowResult.getResultType() == IDnowResult.ResultType.CANCELLED) {
            Log.d("", "Cancelled");
            result = "canceled";
        } else if (iDnowResult.getResultType() == IDnowResult.ResultType.ERROR) {
            Log.d("", "Error: " + iDnowResult.getStatusCode());
            result = "error + iDnowResult.getMessage()";
            Toast.makeText(this, "error: " + iDnowResult.getStatusCode(), Toast.LENGTH_SHORT).show();
        }
        finish();
    }
}
